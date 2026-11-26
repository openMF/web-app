/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CreditOriginationStageCode } from 'app/loans/models/credit-origination-board.model';
import { PendingProspect } from 'app/tasks/tasks.service';
import { resolveProspectProgress } from 'app/tasks/checker-inbox-and-tasks-tabs/pending-prospects/pending-prospects-progress';

export interface CommercialStage {
  code: Exclude<CreditOriginationStageCode, 'RECOVERY'>;
  department: string;
}

// Presentation only: never translate prospect-event codes into loan-board phases.
export const COMMERCIAL_STAGES: readonly CommercialStage[] = [
  { code: 'ONBOARDING', department: 'commercial' },
  { code: 'COMPLIANCE', department: 'compliance' },
  { code: 'PARAMETRIC_SCORE', department: 'credit' },
  { code: 'FILE_INTEGRATION', department: 'executive' },
  { code: 'CREDIT_ANALYSIS', department: 'credit' },
  { code: 'APPROVAL', department: 'committee' },
  { code: 'LEGAL_INSTRUMENTATION', department: 'legal' },
  { code: 'DISBURSEMENT', department: 'committee' }
];

export interface ProspectSnapshot {
  prospect: PendingProspect;
  currentStage?: string;
  lastCompletedStage?: string;
  stoppedAtStage?: string;
}

export function prospectSnapshot(prospect: PendingProspect): ProspectSnapshot {
  const progress = resolveProspectProgress(prospect);
  return {
    prospect,
    currentStage: progress.currentStage,
    lastCompletedStage: progress.lastCompletedStage,
    stoppedAtStage: progress.pendingStep
  };
}

export function validResourceId(id: unknown): id is string | number {
  return (
    (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) || (typeof id === 'string' && /^[1-9]\d*$/.test(id))
  );
}
