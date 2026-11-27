/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { CashHolding } from '../cash-management/cash-management.models';
import { TransactionHistoryItem, TransactionHistorySearch } from '../transaction-history/transaction-history.models';
import { decimalToString } from './teller-decimal';
import { CurrencyRegister } from './teller-workspace.models';
import {
  buildIdentityKey,
  buildMovement,
  deriveHistoryFacts,
  formatBusinessDate,
  formatClock,
  formatMoney,
  formatSignedMoney,
  matchingHoldings,
  recentOperations,
  registerStateOf,
  resolveLocale,
  summarizeRegister
} from './teller-workspace.view';
import { toDecimal } from './teller-decimal';

// Synthetic fixtures only; nothing here mirrors production data.
const holding = (overrides: Partial<CashHolding> = {}): CashHolding => ({
  businessDate: '2026-11-27',
  officeId: 1,
  tellerId: 2,
  cashierId: 3,
  cashierName: 'Synthetic Cashier',
  currencyCode: 'MXN',
  openingFunds: 15000,
  inflows: 62480,
  outflows: 29230,
  settlementsAndDeposits: 0,
  currentBalance: 48250,
  status: 'OPEN',
  ...overrides
});

const row = (overrides: Partial<TransactionHistoryItem> = {}): TransactionHistoryItem => ({
  historyId: 'SAVINGS_DEPOSIT:1',
  transactionDate: '2026-11-27T10:00:00Z',
  operation: 'SAVINGS_DEPOSIT',
  inflow: 100,
  outflow: 0,
  currencyCode: 'MXN',
  decimalPlaces: 2,
  concept: 'SAVINGS_DEPOSIT',
  status: 'COMPLETED',
  reference: 'REF-1',
  tellerId: 3,
  clientId: 9,
  ...overrides
});

const page = (items: TransactionHistoryItem[], total = items.length): TransactionHistorySearch => ({
  items,
  totalFilteredRecords: total,
  offset: 0,
  limit: 500,
  totalsByCurrency: []
});

const text = (value: unknown): string => decimalToString(value as never);

describe('workspace movement and reconciliation', () => {
  it('computes expected cash as opening + inflows − outflows − settlements', () => {
    const movement = buildMovement(holding())!;

    expect(text(movement.expectedCash)).toBe('48250');
    expect(text(movement.cashOnHand)).toBe('48250');
    expect(text(movement.difference)).toBe('0');
  });

  it('subtracts settlements and deposits instead of ignoring them', () => {
    const movement = buildMovement(holding({ settlementsAndDeposits: 5000, currentBalance: 43250 }))!;

    expect(text(movement.expectedCash)).toBe('43250');
    expect(text(movement.difference)).toBe('0');
    // Ignoring the settlement would have produced a false 5,000.00 difference.
    expect(
      text(buildMovement(holding({ settlementsAndDeposits: 5000, currentBalance: 43250 }))!.expectedCash)
    ).not.toBe('48250');
  });

  it('reports a real difference when cash on hand does not match the backend basis', () => {
    const movement = buildMovement(holding({ currentBalance: 48000 }))!;

    expect(text(movement.difference)).toBe('-250');
  });

  it('reports a positive difference (overage) as positive', () => {
    expect(text(buildMovement(holding({ currentBalance: 48300 }))!.difference)).toBe('50');
  });

  it('uses exact decimals, so fractional cents do not create a false difference', () => {
    const movement = buildMovement(
      holding({ openingFunds: 0.1, inflows: 0.2, outflows: 0, settlementsAndDeposits: 0, currentBalance: 0.3 })
    )!;

    expect(text(movement.expectedCash)).toBe('0.3');
    expect(text(movement.difference)).toBe('0.0');
  });

  it('does not compare against the closing context amount, which also includes eligible checks', () => {
    // The backend publishes currentBalance = expectedAmount − checks. A drawer with 2,000 in eligible checks has
    // expectedAmount 50,250 but currentBalance (cash only) 48,250. The cash-only basis must reconcile to zero.
    const movement = buildMovement(holding({ currentBalance: 48250 }))!;

    expect(text(movement.difference)).toBe('0');
    expect(text(movement.cashOnHand)).toBe('48250');
  });

  it.each([
    'openingFunds',
    'inflows',
    'outflows',
    'settlementsAndDeposits',
    'currentBalance'
  ] as const)('is incomplete (null) when %s is missing instead of defaulting to zero', (field) => {
    expect(buildMovement(holding({ [field]: null as unknown as number }))).toBeNull();
    expect(buildMovement(holding({ [field]: undefined as unknown as number }))).toBeNull();
  });

  it('shows the inflow share of movement, and none when nothing moved', () => {
    expect(buildMovement(holding({ inflows: 75, outflows: 25 }))!.inflowShare).toBe(75);
    expect(buildMovement(holding({ inflows: 0, outflows: 0 }))!.inflowShare).toBeNull();
  });

  it('normalises the currency code and never mixes currencies', () => {
    const mxn = buildMovement(holding({ currencyCode: 'mxn' }))!;
    const usd = buildMovement(holding({ currencyCode: 'USD', currentBalance: 48250, inflows: 62480 }))!;

    expect(mxn.currencyCode).toBe('MXN');
    expect(usd.currencyCode).toBe('USD');
  });
});

describe('cashier and business-date scoping', () => {
  it('keeps only holdings of the selected cashier and business date', () => {
    const own = holding();
    const result = matchingHoldings(
      [
        own,
        holding({ cashierId: 99 }),
        holding({ businessDate: '2026-11-26' })
      ],
      3,
      '2026-11-27'
    );

    expect(result.rows).toEqual([own]);
    expect(result.mismatched).toBe(true);
  });

  it('compares cashier ids across string and number', () => {
    expect(matchingHoldings([holding({ cashierId: '3' })], 3, '2026-11-27').mismatched).toBe(false);
  });

  it('reports no mismatch when everything belongs to the session', () => {
    expect(matchingHoldings([holding()], 3, '2026-11-27')).toEqual({ rows: [holding()], mismatched: false });
  });
});

describe('history facts', () => {
  const opening = row({
    historyId: 'CASH_ALLOCATION:5',
    transactionDate: '2026-11-27T08:02:00Z',
    operation: 'ALLOCATE_CASH',
    concept: 'HEAD_CASHIER_ALLOCATION',
    inflow: 15000
  });

  it('takes the opening time from the earliest completed drawer allocation', () => {
    const later = row({ ...opening, historyId: 'CASH_ALLOCATION:6', transactionDate: '2026-11-27T11:00:00Z' });
    const facts = deriveHistoryFacts(
      page([
        later,
        opening
      ])
    );

    expect(facts.openedAt).toBe('2026-11-27T08:02:00Z');
  });

  it.each([
    [
      'a vault opening',
      { concept: 'SAFE_VAULT_OPENING' }
    ],
    [
      'an allocation that is not completed',
      { status: 'PENDING' }
    ],
    [
      'an allocation that sent cash out of this cashier',
      { inflow: 0, outflow: 500 }
    ],
    [
      'an unrelated operation',
      { historyId: 'SAVINGS_DEPOSIT:1', operation: 'SAVINGS_DEPOSIT' }
    ]
  ])('does not treat %s as the register opening', (_name, override) => {
    expect(deriveHistoryFacts(page([row({ ...opening, ...override })])).openedAt).toBeNull();
  });

  it('takes the last cash-count time from the latest completed cashier closing', () => {
    const closing = (id: string, time: string) =>
      row({
        historyId: `CASHIER_CLOSING:${id}`,
        transactionDate: time,
        operation: 'CLOSE_CASHIER',
        concept: 'CASHIER_RECONCILIATION',
        inflow: 0,
        outflow: 900
      });
    const facts = deriveHistoryFacts(
      page([
        closing('1', '2026-11-27T12:00:00Z'),
        closing('2', '2026-11-27T13:15:00Z')
      ])
    );

    expect(facts.lastCountAt).toBe('2026-11-27T13:15:00Z');
  });

  it('reports no cash count when none was recorded', () => {
    expect(deriveHistoryFacts(page([row()])).lastCountAt).toBeNull();
  });

  it('uses the backend record count for operations today', () => {
    expect(deriveHistoryFacts(page([row()], 37)).operationsToday).toBe(37);
  });

  it('counts customer-facing inflows and outflows, excluding internal register movements', () => {
    const facts = deriveHistoryFacts(
      page([
        row({ historyId: 'SAVINGS_DEPOSIT:1' }),
        row({ historyId: 'SAVINGS_DEPOSIT:2' }),
        row({ historyId: 'SAVINGS_WITHDRAWAL:3', operation: 'CASH_WITHDRAWAL', inflow: 0, outflow: 40 }),
        opening,
        row({ historyId: 'CASHIER_CLOSING:1', operation: 'CLOSE_CASHIER', inflow: 0, outflow: 900 })
      ])
    );

    expect(facts.inflowCount).toBe(2);
    expect(facts.outflowCount).toBe(1);
    expect(facts.complete).toBe(true);
  });

  it('reports counts and opening time as unknown when the day was truncated by the page limit', () => {
    const facts = deriveHistoryFacts(
      page(
        [
          opening,
          row()
        ],
        900
      )
    );

    expect(facts.complete).toBe(false);
    expect(facts.inflowCount).toBeNull();
    expect(facts.outflowCount).toBeNull();
    expect(facts.openedAt).toBeNull();
    expect(facts.operationsToday).toBe(900);
  });
});

describe('recent operations', () => {
  const at = (hour: number, id: number, overrides: Partial<TransactionHistoryItem> = {}) =>
    row({
      historyId: `SAVINGS_DEPOSIT:${id}`,
      transactionDate: `2026-11-27T${String(hour).padStart(2, '0')}:00:00Z`,
      reference: `R-${id}`,
      ...overrides
    });

  it('returns the five newest operations, newest first, regardless of API order', () => {
    const items = [
      at(9, 1),
      at(14, 6),
      at(10, 2),
      at(13, 5),
      at(11, 3),
      at(12, 4),
      at(8, 0)
    ];

    expect(recentOperations(items).map((operation) => operation.reference)).toEqual([
      'R-6',
      'R-5',
      'R-4',
      'R-3',
      'R-2'
    ]);
  });

  it('returns fewer than five when fewer exist', () => {
    expect(recentOperations([at(9, 1)])).toHaveLength(1);
    expect(recentOperations([])).toEqual([]);
  });

  it('marks inflows with + and outflows with −, keeping each row in its own currency', () => {
    const [
      deposit,
      withdrawal
    ] = recentOperations([
      at(11, 1, { inflow: 1000, outflow: 0, currencyCode: 'mxn' }),
      at(10, 2, { operation: 'CASH_WITHDRAWAL', inflow: 0, outflow: 1500, currencyCode: 'USD' })
    ]);

    expect(deposit).toMatchObject({ direction: 'in', currencyCode: 'MXN' });
    expect(text(deposit.amount)).toBe('1000');
    expect(withdrawal).toMatchObject({ direction: 'out', currencyCode: 'USD' });
    expect(text(withdrawal.amount)).toBe('1500');
  });

  it('shows no amount, instead of 0.00, when the backend sent none', () => {
    const [operation] = recentOperations([at(9, 1, { inflow: null as unknown as number, outflow: 0 })]);

    expect(operation).toMatchObject({ direction: 'none', amount: null });
  });

  it('shows no amount for an operation that nets to zero', () => {
    expect(recentOperations([at(9, 1, { inflow: 50, outflow: 50 })])[0]).toMatchObject({
      direction: 'none',
      amount: null
    });
  });

  it('sorts rows with an invalid timestamp last', () => {
    const operations = recentOperations([
      at(9, 1, { transactionDate: 'garbage' }),
      at(10, 2)
    ]);

    expect(operations.map((operation) => operation.reference)).toEqual([
      'R-2',
      'R-1'
    ]);
  });
});

describe('register state', () => {
  const register = (state: CurrencyRegister['state'], code = 'MXN'): CurrencyRegister => ({
    currencyCode: code,
    state,
    closingId: null
  });

  it.each([
    [
      'OPEN',
      'open'
    ],
    [
      'NOT_OPENED',
      'not-opened'
    ],
    [
      'COMPLETED',
      'completed'
    ],
    [
      'SOMETHING_ELSE',
      'unknown'
    ],
    [
      undefined,
      'unknown'
    ],
    [
      null,
      'unknown'
    ]
  ])('maps the backend status %p to %s', (status, state) => {
    expect(registerStateOf(status)).toBe(state);
  });

  it('is unknown when the status could not be loaded', () => {
    expect(summarizeRegister(null)).toBe('unknown');
  });

  it('is not opened when the cashier has no cash movement at all today', () => {
    expect(summarizeRegister([])).toBe('not-opened');
  });

  it('is open when any currency register is open', () => {
    expect(
      summarizeRegister([
        register('completed'),
        register('open', 'USD')
      ])
    ).toBe('open');
  });

  it('is completed only when nothing is open and a closing finished', () => {
    expect(summarizeRegister([register('completed')])).toBe('completed');
    expect(
      summarizeRegister([
        register('completed'),
        register('not-opened', 'USD')
      ])
    ).toBe('completed');
  });

  it('is unknown rather than guessed when a currency state is unknown and none is open', () => {
    expect(
      summarizeRegister([
        register('completed'),
        register('unknown', 'USD')
      ])
    ).toBe('unknown');
  });

  it('is not opened when every currency is not opened', () => {
    expect(summarizeRegister([register('not-opened')])).toBe('not-opened');
  });
});

describe('identity key', () => {
  const base = { tenant: 'default', userId: 1, officeId: 2, staffId: 3, businessDate: '2026-11-27' };

  it('changes with the tenant, user, office, staff or business date', () => {
    const key = buildIdentityKey(base);

    expect(buildIdentityKey({ ...base, tenant: 'other' })).not.toBe(key);
    expect(buildIdentityKey({ ...base, userId: 9 })).not.toBe(key);
    expect(buildIdentityKey({ ...base, officeId: 9 })).not.toBe(key);
    expect(buildIdentityKey({ ...base, staffId: 9 })).not.toBe(key);
    expect(buildIdentityKey({ ...base, businessDate: '2026-11-28' })).not.toBe(key);
    expect(buildIdentityKey({ ...base })).toBe(key);
  });
});

describe('formatting', () => {
  const amount = (value: number | string) => toDecimal(value)!;

  it('formats currency with the locale and keeps the cents', () => {
    expect(formatMoney(amount('48250'), 'MXN', 'en-US')).toBe('$48,250.00');
    expect(formatMoney(amount('1500.5'), 'USD', 'en-US')).toBe('$1,500.50');
  });

  it('honours the locale separators', () => {
    expect(formatMoney(amount('48250'), 'EUR', 'de-DE')).toContain('48.250,00');
  });

  it('honours a currency without minor units', () => {
    expect(formatMoney(amount('1500'), 'JPY', 'en-US')).toBe('¥1,500');
  });

  it('honours an explicit number of decimal places from the backend', () => {
    expect(formatMoney(amount('10'), 'MXN', 'en-US', 3)).toBe('$10.000');
  });

  it('does not round away precision finer than the currency minor unit', () => {
    expect(formatMoney(amount('0.004'), 'MXN', 'en-US')).toBe('$0.004');
  });

  it('falls back to a plain amount and code for an invalid currency instead of throwing', () => {
    expect(formatMoney(amount('12.5'), 'NOPE!', 'en-US')).toBe('12.5 NOPE!');
  });

  it('formats signed amounts with + and the real minus sign', () => {
    expect(formatSignedMoney(amount('1000'), 'in', 'MXN', 'en-US')).toBe('+$1,000.00');
    expect(formatSignedMoney(amount('1500'), 'out', 'MXN', 'en-US')).toBe('−$1,500.00');
    expect(formatSignedMoney(amount('5'), 'none', 'MXN', 'en-US')).toBe('$5.00');
  });

  it('formats clock times in the requested zone and rejects invalid timestamps', () => {
    expect(formatClock('2026-11-27T13:15:00Z', 'en-GB', 'UTC')).toBe('13:15');
    expect(formatClock('not a date', 'en-GB', 'UTC')).toBeNull();
    expect(formatClock(null, 'en-GB')).toBeNull();
  });

  it('formats the business date without a timezone shift', () => {
    expect(formatBusinessDate('2026-11-17', 'en-US')).toBe('Tuesday, Nov 17, 2026');
    expect(formatBusinessDate('17/11/2026', 'en-US')).toBeNull();
  });

  it('falls back to en-US for an invalid locale', () => {
    expect(resolveLocale('es-MX')).toBe('es-MX');
    expect(resolveLocale('not a locale!!')).toBe('en-US');
    expect(resolveLocale(undefined)).toBe('en-US');
  });
});
