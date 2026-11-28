/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EnrollmentCase, KycEvidence } from 'app/tasks/tasks.service';
import {
  ONBOARDING_STAGES,
  agingBand,
  attentionRows,
  enrollmentRow,
  recordedInstant,
  uniqueEnrollmentRows
} from './onboarding-pipeline.model';

const synthetic = (id = 1): EnrollmentCase => ({ clientId: id, clientName: `Synthetic client ${id}`, officeId: 1 });

describe('Source-qualified onboarding adapter', () => {
  it('has the six required stages in order', () => {
    expect(enrollmentRow(synthetic()).stages.map((stage) => stage.id)).toEqual(ONBOARDING_STAGES);
  });

  it.each([
    [
      'Approved',
      'completed'
    ],
    [
      'Pending',
      'pending'
    ],
    [
      'In Progress',
      'inProgress'
    ],
    [
      'In Review',
      'review'
    ],
    [
      'Declined',
      'failed'
    ],
    [
      'Rejected',
      'failed'
    ],
    [
      'NOT_APPROVED',
      'unknown'
    ],
    [
      'alien',
      'unknown'
    ]
  ])('maps the recorded KYC status %s to %s', (status, expected) => {
    expect(
      enrollmentRow({ ...synthetic(), kycEvidence: { verificationId: 8, derivedKycStatus: status } }).stages[0].state
    ).toBe(expected);
  });

  it('does not complete KYC from activation, generic level names, or session existence', () => {
    const row = enrollmentRow({
      ...synthetic(),
      clientLifecycleStatus: 'clientStatusType.active',
      enrollmentStages: [
        { name: 'ACTIVATION', status: 'COMPLETED' },
        { name: 'KYC_LEVEL_3', status: 'COMPLETED' }
      ],
      kycEvidence: { verificationId: 8, sessionId: 'synthetic' }
    });
    expect(row.stages.every((stage) => stage.state === 'unknown')).toBe(true);
    expect(row.currentStage).toBeNull();
  });

  it('requires verification identity for evidence', () => {
    const row = enrollmentRow({
      ...synthetic(),
      kycEvidence: {
        derivedKycStatus: 'Approved',
        amlScreeningEvidencePresent: true,
        amlScreeningEvidenceStatus: 'APPROVED',
        amlScreeningEvidenceSucceeded: true
      }
    });
    expect(row.stages.every((stage) => stage.state === 'unknown')).toBe(true);
  });

  it.each([
    'pld',
    'biometric'
  ] as const)('requires present, approved and successful %s evidence', (id) => {
    const prefix = id === 'pld' ? 'amlScreening' : 'faceMatch';
    const evidence: KycEvidence = {
      verificationId: 2,
      [`${prefix}EvidencePresent`]: true,
      [`${prefix}EvidenceStatus`]: 'APPROVED',
      [`${prefix}EvidenceSucceeded`]: true
    };
    expect(
      enrollmentRow({ ...synthetic(), kycEvidence: evidence }).stages.find((stage) => stage.id === id)?.state
    ).toBe('completed');
    for (const missing of [
      `${prefix}EvidencePresent`,
      `${prefix}EvidenceStatus`,
      `${prefix}EvidenceSucceeded`
    ]) {
      const incomplete: KycEvidence = { ...evidence, [missing]: undefined };
      expect(
        enrollmentRow({ ...synthetic(), kycEvidence: incomplete }).stages.find((stage) => stage.id === id)?.state
      ).toBe('unknown');
    }
  });

  it.each([
    'NOT_APPROVED',
    'BLOCKED',
    'IN_PROGRESS',
    'FAILED',
    'PENDING',
    'UNKNOWN'
  ])('does not invent a PLD alert from evidence status %s', (status) => {
    const row = enrollmentRow({
      ...synthetic(),
      kycEvidence: {
        verificationId: 2,
        amlScreeningEvidencePresent: true,
        amlScreeningEvidenceStatus: status,
        amlScreeningEvidenceSucceeded: false
      }
    });
    expect(row.stages[1].state).toBe('unknown');
    expect(attentionRows([row])).toEqual([]);
  });

  it('preserves independent evidence instead of forcing a sequential workflow', () => {
    const row = enrollmentRow({
      ...synthetic(),
      kycEvidence: {
        verificationId: 3,
        derivedKycStatus: 'In Review',
        faceMatchEvidencePresent: true,
        faceMatchEvidenceStatus: 'APPROVED',
        faceMatchEvidenceSucceeded: true
      }
    });
    expect(row.stages.slice(0, 3).map((stage) => stage.state)).toEqual([
      'review',
      'unknown',
      'completed'
    ]);
  });

  it.each([
    'N1',
    'N2',
    'N3',
    'ISSUED',
    'NO_CARD'
  ])('ignores uncontracted account/card values: %s', (value) => {
    const record = { ...synthetic(), accountLevel: value, cardDecision: value, internalControl: 'COMPLETED' };
    expect(
      enrollmentRow(record)
        .stages.slice(3)
        .map((stage) => stage.state)
    ).toEqual([
      'unknown',
      'unknown',
      'unknown'
    ]);
  });

  it.each([
    undefined,
    'invalid',
    '2026-02-30',
    '2026-11-26',
    '2026-11-27T00:30:00Z',
    '2026-11-25T23:30:00-08:00',
    '2026-03-08T01:30:00-05:00'
  ])('never turns registration/session timestamp %s into stage aging', (date) => {
    const row = enrollmentRow({
      ...synthetic(),
      enrollmentStages: [
        {
          name: 'COMMERCIAL_REGISTRATION',
          status: 'UNKNOWN',
          startedAt: date,
          aging: { days: 12, source: 'registration' }
        }
      ],
      kycEvidence: {
        verificationId: 3,
        derivedKycStatus: 'In Progress',
        verificationCreatedAt: date,
        verificationLastModifiedAt: date
      }
    });
    expect(row.currentStage).toBeNull();
    expect(row.stages.every((stage) => stage.days === null)).toBe(true);
  });

  it.each([
    [
      0,
      'neutral'
    ],
    [
      1,
      'yellow'
    ],
    [
      5,
      'yellow'
    ],
    [
      6,
      'orange'
    ],
    [
      10,
      'orange'
    ],
    [
      11,
      'red'
    ],
    [
      null,
      'neutral'
    ],
    [
      -1,
      'neutral'
    ],
    [
      NaN,
      'neutral'
    ],
    [
      Infinity,
      'neutral'
    ],
    [
      1.5,
      'neutral'
    ]
  ] as const)('defines the legend threshold for %s days', (days, band) => {
    expect(agingBand(days)).toBe(band);
  });

  it.each([
    '2026-02-30T00:00:00Z',
    '2026-11-26T25:00:00Z',
    '2026-11-26T12:00:00',
    '2026-11-25T23:30:00+00:99',
    '2026-11-25T23:30:00-00:60',
    '2026-11-25T23:30:00+24:00',
    '2026-11-25T23:30:00-99:00',
    'invalid',
    null
  ])('rejects invalid or ambiguous recorded instant %s', (value) => {
    expect(recordedInstant(value)).toBeNull();
  });

  it('preserves the timezone of a verified recorded update, without claiming historical events', () => {
    const stamp = '2026-11-25T23:30:00-08:00';
    expect(recordedInstant(stamp)).toBe(stamp);
    const row = enrollmentRow({
      ...synthetic(),
      kycEvidence: { verificationId: 3, derivedKycStatus: 'Approved', verificationLastModifiedAt: stamp }
    });
    expect(row.stages[0].recordedAt).toBe(stamp);
    expect(row.stages.slice(1).every((stage) => stage.recordedAt === null)).toBe(true);
  });

  it('deduplicates identical client records, never merging by name', () => {
    expect(
      uniqueEnrollmentRows([
        synthetic(1),
        synthetic(1),
        { ...synthetic(2), clientName: 'Synthetic client 1' }
      ])
    ).toHaveLength(2);
  });

  it('deduplicates equivalent string and numeric owner IDs while retaining the first row', () => {
    const first = { ...synthetic(7), officeId: 3 };
    const equivalent = { ...first, clientId: '7', officeId: '3' };
    const rows = uniqueEnrollmentRows([
      first,
      equivalent
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].clientId).toBe(7);
    expect(rows[0].officeId).toBe(3);
  });

  it('rejects canonical duplicates with different offices or stage evidence', () => {
    const first = { ...synthetic(7), officeId: 3 };
    expect(() =>
      uniqueEnrollmentRows([
        first,
        { ...first, clientId: '7', officeId: '4' }
      ])
    ).toThrow();
    expect(() =>
      uniqueEnrollmentRows([
        first,
        { ...first, clientId: '7', officeId: '3', kycEvidence: { verificationId: 1, derivedKycStatus: 'Approved' } }
      ])
    ).toThrow();
  });

  it.each([
    '2026-11-25T23:30:00Z',
    '2026-11-25T23:30:00+05:30',
    '2026-11-25T23:30:00-08:00'
  ])('accepts a valid zoned instant %s', (value) => {
    expect(recordedInstant(value)).toBe(value);
  });

  it('rejects conflicting duplicates and invalid identities', () => {
    expect(() =>
      uniqueEnrollmentRows([
        synthetic(),
        { ...synthetic(), clientName: 'Conflicting' }
      ])
    ).toThrow();
    expect(() => enrollmentRow({ clientId: '../2' })).toThrow();
  });

  it('does not classify a completed or unknown current-stage model as overdue', () => {
    for (const state of [
      'completed',
      'unknown'
    ] as const) {
      const row = enrollmentRow(synthetic());
      row.currentStage = 'kyc';
      row.stages[0].state = state;
      row.stages[0].days = 12;
      expect(attentionRows([row])).toEqual([]);
    }
  });

  it('prioritizes explicit block, overdue, at-risk, then review without declaring unknown healthy', () => {
    // Presentation models only: the audited endpoint cannot supply PLD blocks/current-stage aging.
    const blocked = enrollmentRow(synthetic(4));
    blocked.stages[1].state = 'blocked';
    const overdue = enrollmentRow(synthetic(3));
    overdue.currentStage = 'kyc';
    overdue.stages[0].days = 11;
    overdue.stages[0].state = 'inProgress';
    const risk = enrollmentRow(synthetic(2));
    risk.currentStage = 'kyc';
    risk.stages[0].days = 6;
    risk.stages[0].state = 'inProgress';
    const review = enrollmentRow(synthetic(1));
    review.stages[0].state = 'review';
    expect(
      attentionRows([
        enrollmentRow(synthetic(5)),
        risk,
        review,
        overdue,
        blocked
      ]).map((row) => row.clientId)
    ).toEqual([
      4,
      3,
      2,
      1
    ]);
    expect(blocked.stages[1].days).toBeNull();
  });
});
