/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import moment from 'moment';
import { EnrollmentCase, KycEvidence } from 'app/tasks/tasks.service';

export const ONBOARDING_STAGES = [
  'kyc',
  'pld',
  'biometric',
  'accountLevel',
  'card',
  'internalControl'
] as const;
export type OnboardingStageId = (typeof ONBOARDING_STAGES)[number];
export type StageState =
  'completed' | 'inProgress' | 'pending' | 'review' | 'blocked' | 'failed' | 'notApplicable' | 'unknown';
export type AgingBand = 'neutral' | 'yellow' | 'orange' | 'red';

export interface PipelineStage {
  id: OnboardingStageId;
  state: StageState;
  detail: 'decision' | 'approvedEvidence' | 'notApprovedEvidence' | 'noEvidence' | 'missingContract';
  recordedAt: string | null;
  days: number | null;
}

export interface EnrollmentRow {
  clientId: number | string;
  clientName: string;
  officeId: number | string | null;
  stages: PipelineStage[];
  // The audited projection has neither a current pipeline stage nor a case-completion decision.
  currentStage: OnboardingStageId | null;
}

export function validEnrollmentId(id: unknown): id is number | string {
  return (
    (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) || (typeof id === 'string' && /^[1-9]\d*$/.test(id))
  );
}

export function agingBand(days: number | null): AgingBand {
  if (!Number.isSafeInteger(days) || days === null || days < 1) return 'neutral';
  return days <= 5 ? 'yellow' : days <= 10 ? 'orange' : 'red';
}

/** Only render actual, zoned instants; never use session timestamps as stage-entry dates. */
export function recordedInstant(value: unknown): string | null {
  if (typeof value !== 'string' || !/(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) return null;
  return moment.parseZone(value, moment.ISO_8601, true).isValid() ? value : null;
}

function kycState(value: unknown): StageState {
  if (typeof value !== 'string') return 'unknown';
  switch (value.trim().toUpperCase()) {
    case 'APPROVED':
      return 'completed';
    case 'IN PROGRESS':
      return 'inProgress';
    case 'IN REVIEW':
      return 'review';
    case 'PENDING':
      return 'pending';
    case 'DECLINED':
    case 'REJECTED':
      return 'failed';
    default:
      return 'unknown';
  }
}

function evidenceStage(id: 'pld' | 'biometric', evidence?: KycEvidence | null): PipelineStage {
  const prefix = id === 'pld' ? 'amlScreening' : 'faceMatch';
  const present = evidence?.[`${prefix}EvidencePresent`] === true;
  const approved =
    present &&
    evidence?.[`${prefix}EvidenceStatus`] === 'APPROVED' &&
    evidence?.[`${prefix}EvidenceSucceeded`] === true;
  return {
    id,
    state: approved ? 'completed' : 'unknown',
    detail: approved ? 'approvedEvidence' : present ? 'notApprovedEvidence' : 'noEvidence',
    recordedAt: null,
    days: null
  };
}

/** Exact KycEvidenceData projection, not generic KYC levels, lifecycle, or raw watch-list hits. */
export function enrollmentRow(record: EnrollmentCase): EnrollmentRow {
  if (!validEnrollmentId(record?.clientId) || (record.clientName != null && typeof record.clientName !== 'string')) {
    throw new Error('Invalid enrollment identity');
  }
  const evidence = record.kycEvidence;
  const hasVerification = validEnrollmentId(evidence?.verificationId);
  const state = hasVerification ? kycState(evidence.derivedKycStatus) : 'unknown';
  const stages: PipelineStage[] = [
    {
      id: 'kyc',
      state,
      detail: state === 'unknown' ? 'noEvidence' : 'decision',
      recordedAt: hasVerification ? recordedInstant(evidence.verificationLastModifiedAt) : null,
      days: null
    },
    evidenceStage('pld', hasVerification ? evidence : null),
    evidenceStage('biometric', hasVerification ? evidence : null),
    ...([
        'accountLevel',
        'card',
        'internalControl'
      ] as const).map((id): PipelineStage => ({
      id,
      state: 'unknown',
      detail: 'missingContract',
      recordedAt: null,
      days: null
    }))
  ];
  return {
    clientId: record.clientId,
    clientName: record.clientName?.trim() || '',
    officeId: validEnrollmentId(record.officeId) ? record.officeId : null,
    stages,
    currentStage: null
  };
}

/** Stable client identity, not a prospect ID or a name-based join. */
export function uniqueEnrollmentRows(records: EnrollmentCase[]): EnrollmentRow[] {
  const unique = new Map<string, EnrollmentRow>();
  const comparable = (row: EnrollmentRow) =>
    JSON.stringify({
      ...row,
      clientId: String(row.clientId),
      officeId: row.officeId == null ? null : String(row.officeId)
    });
  for (const record of records) {
    const row = enrollmentRow(record);
    const key = String(row.clientId);
    const existing = unique.get(key);
    // Conflicting duplicates cannot be resolved without a case/version contract.
    if (existing && comparable(existing) !== comparable(row)) throw new Error('Conflicting enrollment cases');
    if (!existing) unique.set(key, row);
  }
  return [...unique.values()];
}

export function attentionRows(rows: EnrollmentRow[]): EnrollmentRow[] {
  const priority = (row: EnrollmentRow): number => {
    if (row.stages.some((stage) => stage.id === 'pld' && (stage.state === 'blocked' || stage.state === 'review')))
      return 0;
    const current = row.stages.find(
      (stage) => stage.id === row.currentStage && ![
          'completed',
          'notApplicable',
          'unknown'
        ].includes(stage.state)
    );
    if (agingBand(current?.days ?? null) === 'red') return 1;
    if (agingBand(current?.days ?? null) === 'orange') return 2;
    return row.stages.some((stage) => stage.state === 'failed' || stage.state === 'review') ? 3 : 4;
  };
  return rows.filter((row) => priority(row) < 4).sort((a, b) => priority(a) - priority(b));
}
