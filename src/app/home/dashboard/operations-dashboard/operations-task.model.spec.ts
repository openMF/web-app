import {
  agingCategory,
  calendarDay,
  creditTask,
  enrollmentTasks,
  matchesTask,
  prospectTask,
  sortTasks,
  validTaskKey,
  waitingDays
} from './operations-task.model';

const loan = (id = 1, date: string | number[] = '2026-11-08') =>
  creditTask(
    {
      loanId: id,
      clientId: 5,
      clientName: 'Synthetic Client',
      accountNo: 'R-01',
      status: { id: 100 },
      submittedOnDate: date
    },
    'approval',
    '2026-11-27'
  )[0];

describe('Operations task normalization', () => {
  it.each([
    [
      null,
      'unknown'
    ],
    [
      -1,
      'unknown'
    ],
    [
      NaN,
      'unknown'
    ],
    [
      0,
      'neutral'
    ],
    [
      1,
      'on-time'
    ],
    [
      5,
      'on-time'
    ],
    [
      6,
      'at-risk'
    ],
    [
      10,
      'at-risk'
    ],
    [
      11,
      'overdue'
    ],
    [
      19,
      'overdue'
    ],
    [
      1.5,
      'unknown'
    ]
  ])('classifies %s as %s', (days, expected) => expect(agingCategory(days as number)).toBe(expected));
  it.each([
    '2026-02-30',
    '2026-13-01',
    '2026-00-01',
    '2026-11-00',
    '2026-11-27T23:59:00Z',
    '',
    null,
    [
      2026,
      2,
      30
    ],
    [
      2026,
      11
    ],
    [
      2026,
      11,
      27,
      1
    ]
  ])('rejects invalid calendar value %s', (value) => expect(calendarDay(value)).toBeNull());
  it('accepts leap dates and array dates without local timezone rollover', () => {
    expect(
      waitingDays(
        '2024-02-29',
        [
          2024,
          3,
          1
        ]
      )
    ).toBe(1);
    expect(
      waitingDays(
        [
          2026,
          11,
          27
        ],
        '2026-11-27'
      )
    ).toBe(0);
  });
  it('requires a valid business date and rejects future dates', () => {
    expect(waitingDays('2026-11-28', '2026-11-27')).toBeNull();
    expect(waitingDays('2026-11-01', null)).toBeNull();
  });
  it('uses composite resource keys and explicit pending loan states', () => {
    expect(loan().key).toBe('loan:1:approval');
    expect(loan().daysWaiting).toBe(19);
    expect(prospectTask({ prospectId: 1, registrationStatus: 'PENDING' })[0].key).toBe('prospect:1');
    expect(() => creditTask({ loanId: 1, status: { id: 300 } }, 'approval', '2026-11-27')).toThrow();
  });
  it('does not use submission as disbursement waiting time', () => {
    const task = creditTask(
      { loanId: 1, status: { id: 200 }, submittedOnDate: '2026-01-01' },
      'disbursement',
      '2026-11-27'
    )[0];
    expect(task.daysWaiting).toBeNull();
    expect(task.startedAt).toBeNull();
  });
  it.each([
    'COMPLETED',
    'REJECTED',
    'WITHDRAWN',
    null,
    'UNKNOWN'
  ])('excludes terminal or unknown registration %s', (status) =>
    expect(prospectTask({ prospectId: 1, registrationStatus: status })).toEqual([])
  );
  it('never treats prospect technical timestamps, stopped stages or credit counts as breach or escalation evidence', () => {
    const task = prospectTask({
      prospectId: 1,
      registrationStatus: 'IN_PROGRESS',
      createdAt: '2020-01-01',
      submittedAt: '2020-01-01',
      lastUpdatedAt: '2020-01-01',
      stoppedAtStage: 'PLD',
      pendingCreditCount: 20
    })[0];
    expect(task.daysWaiting).toBeNull();
    expect(task.agingCategory).toBe('unknown');
    expect(task.flags).toEqual([]);
    expect(task.eligibleActions).toEqual([]);
    expect(task.ownerState).toBe('unknown');
    expect(task.ownerId).toBeUndefined();
  });
  it('does not treat every enrollment/client as a pending prospect', () => {
    expect(
      enrollmentTasks({
        clientId: 2,
        enrollmentStages: [
          { name: 'ACTIVATION', status: 'COMPLETED' },
          { name: 'KYC', status: 'UNKNOWN' }
        ]
      })
    ).toEqual([]);
    const task = enrollmentTasks({
      clientId: 2,
      enrollmentStages: [{ name: 'ACTIVATION', status: 'PENDING', startedAt: '2020-01-01', aging: { days: 100 } }]
    })[0];
    expect(task.source).toBe('onboarding');
    expect(task.key).toBe('enrollment:2:ACTIVATION');
    expect(task.daysWaiting).toBeNull();
    expect(task.flags).toEqual([]);
  });
  it('sorts verified ages first with deterministic ties and unknown last', () => {
    const a = loan(1),
      b = loan(2),
      c = loan(3, '2026-11-26'),
      unknown = loan(4, 'invalid');
    expect(
      sortTasks([
        unknown,
        c,
        b,
        a
      ]).map((task) => task.sourceId)
    ).toEqual([
      '1',
      '2',
      '3',
      '4'
    ]);
  });
  it('filters by customer, reference, area and verified age', () => {
    expect(matchesTask(loan(), 'SYNTHETIC', 'loan', 'overdue', false)).toBe(true);
    expect(matchesTask(loan(), 'R-01', 'loan', 'on-time', false)).toBe(false);
    expect(matchesTask(loan(), '', 'prospect', 'all', false)).toBe(false);
  });
  it('only mine requires authoritative staff identity and assignment, never a display name', () => {
    expect(matchesTask(loan(), '', '', 'all', true, 7)).toBe(false);
    const assigned = { ...loan(), ownerState: 'assigned' as const, ownerId: 7, ownerName: 'Someone else' };
    expect(matchesTask(assigned, '', '', 'all', true, 7)).toBe(true);
    expect(matchesTask(assigned, '', '', 'all', true, 8)).toBe(false);
    expect(matchesTask({ ...assigned, ownerState: 'unassigned' }, '', '', 'all', true, 7)).toBe(false);
  });
  it.each([
    'prospect:1',
    'loan:2:approval',
    'loan:2:disbursement',
    'enrollment:3:ACTIVATION'
  ])('accepts qualified navigation key %s', (key) => expect(validTaskKey(key)).toBe(true));
  it.each([
    '1',
    'prospect:-1',
    'loan:3',
    'client:1',
    'prospect:01',
    'loan:1:delete',
    '<script>'
  ])('rejects navigation key %s', (key) => expect(validTaskKey(key)).toBe(false));
  it('rejects conflicting activation snapshots instead of inventing pending work', () => {
    expect(() =>
      enrollmentTasks({
        clientId: 1,
        enrollmentStages: [
          { name: 'ACTIVATION', status: 'PENDING' },
          { name: 'ACTIVATION', status: 'COMPLETED' }
        ]
      })
    ).toThrow();
  });
});
