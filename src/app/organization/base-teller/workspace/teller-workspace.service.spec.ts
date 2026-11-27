/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Subject, of, throwError } from 'rxjs';

import { BaseTellerService } from '../base-teller.service';
import { CashierClosingContext, CashierClosingReceipt } from '../cash-management/cash-management.models';
import { TransactionHistorySearch } from '../transaction-history/transaction-history.models';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { WorkspaceIdentity } from './teller-workspace.models';
import { TellerWorkspaceService, WORKSPACE_HISTORY_LIMIT, registerFromContext } from './teller-workspace.service';

const identity = (staffId: number | null = 7): WorkspaceIdentity => ({
  tenant: 'default',
  userId: 1,
  officeId: 1,
  staffId,
  businessDate: '2026-11-27',
  key: `default|1|1|${staffId}|2026-11-27`
});

const httpError = (status: number) => new HttpErrorResponse({ status });

type Mocked = {
  getCashManagementTellers: jest.Mock;
  getCashManagementCashiers: jest.Mock;
  getCashHoldings: jest.Mock;
  getCashierClosingContext: jest.Mock;
  getCashierClosing: jest.Mock;
};

describe('TellerWorkspaceService', () => {
  let service: TellerWorkspaceService;
  let base: Mocked;
  let history: { search: jest.Mock };

  beforeEach(() => {
    base = {
      getCashManagementTellers: jest.fn(),
      getCashManagementCashiers: jest.fn(),
      getCashHoldings: jest.fn(),
      getCashierClosingContext: jest.fn(),
      getCashierClosing: jest.fn()
    };
    history = { search: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: BaseTellerService, useValue: base },
        { provide: TransactionHistoryService, useValue: history }
      ]
    });
    service = TestBed.inject(TellerWorkspaceService);
  });

  const resolve = async (staffId: number | null = 7) => {
    let result: unknown;
    service.resolveAssignments(identity(staffId)).subscribe((value) => (result = value));
    return result;
  };

  describe('resolving the signed-in user to a teller window', () => {
    it('reports no staff link without calling the API when the user has no staff id', async () => {
      expect(await resolve(null)).toEqual({ kind: 'none', reason: 'no-staff' });
      expect(base.getCashManagementTellers).not.toHaveBeenCalled();
    });

    it('returns the one cashier whose staff id matches the user', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2, name: 'Window 2' }]));
      base.getCashManagementCashiers.mockReturnValue(
        of({
          tellerName: 'Window 2',
          officeName: 'Central',
          cashiers: [
            { id: 31, staffId: 7, staffName: 'Mariana' },
            { id: 32, staffId: 8, staffName: 'Someone Else' }
          ]
        })
      );

      expect(await resolve()).toEqual({
        kind: 'resolved',
        assignments: [
          { cashierId: 31, tellerId: 2, tellerName: 'Window 2', cashierName: 'Mariana', officeName: 'Central' }
        ]
      });
    });

    it('never picks another staff member cashier just because it is first in the list', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2, name: 'Window 2' }]));
      base.getCashManagementCashiers.mockReturnValue(
        of({ cashiers: [{ id: 99, staffId: 8, staffName: 'First Listed' }] })
      );

      expect(await resolve()).toEqual({ kind: 'none', reason: 'no-assignment' });
    });

    it('does not match a cashier that has no staff id', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2 }]));
      base.getCashManagementCashiers.mockReturnValue(
        of([
          { id: 1, staffId: null },
          { id: 2 }
        ])
      );

      expect(await resolve()).toEqual({ kind: 'none', reason: 'no-assignment' });
    });

    it('matches staff ids across string and number', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2 }]));
      base.getCashManagementCashiers.mockReturnValue(of([{ id: 5, staffId: '7', staffName: 'M' }]));

      expect(await resolve()).toMatchObject({ kind: 'resolved', assignments: [{ cashierId: 5 }] });
    });

    it('returns every window of a user assigned to several, ordered, so the user can choose', async () => {
      base.getCashManagementTellers.mockReturnValue(
        of([
          { id: 2, name: 'Window B' },
          { id: 3, name: 'Window A' }
        ])
      );
      base.getCashManagementCashiers.mockImplementation((tellerId: number) =>
        of({ tellerName: tellerId === 2 ? 'Window B' : 'Window A', cashiers: [{ id: tellerId * 10, staffId: 7 }] })
      );

      const result = (await resolve()) as { kind: string; assignments: { tellerName: string }[] };

      expect(result.kind).toBe('resolved');
      expect(result.assignments.map((assignment) => assignment.tellerName)).toEqual([
        'Window A',
        'Window B'
      ]);
    });

    it('accepts a paged teller list and a bare cashier array', async () => {
      base.getCashManagementTellers.mockReturnValue(of({ pageItems: [{ id: 2, name: 'W' }] }));
      base.getCashManagementCashiers.mockReturnValue(of([{ id: 5, staffId: 7, cashierName: 'Alt name' }]));

      expect(await resolve()).toMatchObject({
        assignments: [{ cashierId: 5, tellerName: 'W', cashierName: 'Alt name' }]
      });
    });

    it('de-duplicates a cashier returned twice', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2 }]));
      base.getCashManagementCashiers.mockReturnValue(
        of([
          { id: 5, staffId: 7 },
          { id: 5, staffId: 7 }
        ])
      );

      expect(((await resolve()) as { assignments: unknown[] }).assignments).toHaveLength(1);
    });

    it('reports no assignment when the institution has no tellers', async () => {
      base.getCashManagementTellers.mockReturnValue(of([]));

      expect(await resolve()).toEqual({ kind: 'none', reason: 'no-assignment' });
    });

    it('requests quietly so a missing permission shows a local state instead of a global error', async () => {
      base.getCashManagementTellers.mockReturnValue(of([{ id: 2 }]));
      base.getCashManagementCashiers.mockReturnValue(of([]));
      await resolve();

      expect(base.getCashManagementTellers).toHaveBeenCalledWith({ localErrors: true });
      expect(base.getCashManagementCashiers).toHaveBeenCalledWith(2, { localErrors: true });
    });

    it.each([
      [
        403,
        'forbidden'
      ],
      [
        401,
        'forbidden'
      ],
      [
        500,
        'unavailable'
      ],
      [
        0,
        'unavailable'
      ]
    ])('reports HTTP %s on the teller list as %s', async (status, reason) => {
      base.getCashManagementTellers.mockReturnValue(throwError(() => httpError(status)));

      expect(await resolve()).toEqual({ kind: 'error', reason });
    });

    it('fails the whole resolution when any cashier lookup fails, because a missing window could hide a second assignment', async () => {
      base.getCashManagementTellers.mockReturnValue(
        of([
          { id: 2 },
          { id: 3 }
        ])
      );
      base.getCashManagementCashiers.mockImplementation((tellerId: number) =>
        tellerId === 2 ? of([{ id: 5, staffId: 7 }]) : throwError(() => httpError(500))
      );

      expect(await resolve()).toEqual({ kind: 'error', reason: 'unavailable' });
    });

    it('looks up cashiers with bounded concurrency', () => {
      base.getCashManagementTellers.mockReturnValue(of(Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }))));
      const lookups: Subject<unknown[]>[] = [];
      base.getCashManagementCashiers.mockImplementation(() => {
        const lookup = new Subject<unknown[]>();
        lookups.push(lookup);
        return lookup;
      });
      let result: unknown;
      service.resolveAssignments(identity()).subscribe((value) => (result = value));

      // Only four lookups are in flight at first, not twelve.
      expect(lookups).toHaveLength(4);

      // Finishing one starts the next; the array grows while the loop runs.
      for (let index = 0; index < lookups.length; index++) {
        lookups[index].next([]);
        lookups[index].complete();
      }

      expect(lookups).toHaveLength(12);
      expect(result).toEqual({ kind: 'none', reason: 'no-assignment' });
    });
  });

  describe('holdings', () => {
    it('loads the holdings of exactly one cashier and business date, quietly', async () => {
      const rows = [{ currencyCode: 'MXN' }];
      base.getCashHoldings.mockReturnValue(of(rows));
      let section: unknown;
      service.loadHoldings(31, '2026-11-27').subscribe((value) => (section = value));

      expect(base.getCashHoldings).toHaveBeenCalledWith(
        { cashierId: 31, businessDate: '2026-11-27' },
        { localErrors: true }
      );
      expect(section).toEqual({ status: 'ready', data: rows });
    });

    it.each([
      [
        403,
        'forbidden'
      ],
      [
        500,
        'error'
      ]
    ])('maps HTTP %s to %s', (status, expected) => {
      base.getCashHoldings.mockReturnValue(throwError(() => httpError(status)));
      let section: unknown;
      service.loadHoldings(31, '2026-11-27').subscribe((value) => (section = value));

      expect(section).toEqual({ status: expected });
    });

    it('rejects a malformed response instead of showing it', () => {
      base.getCashHoldings.mockReturnValue(of({ nope: true }));
      let section: unknown;
      service.loadHoldings(31, '2026-11-27').subscribe((value) => (section = value));

      expect(section).toEqual({ status: 'error' });
    });
  });

  describe('register status', () => {
    const context = (overrides: Partial<CashierClosingContext> = {}): CashierClosingContext =>
      ({
        businessDate: '2026-11-27',
        cashierId: 31,
        currencyCode: 'MXN',
        status: 'OPEN',
        registerStatus: 'OPEN',
        closingId: null,
        ...overrides
      }) as CashierClosingContext;

    const run = (currencies: string[]) => {
      let section: unknown;
      service.loadRegisters(31, currencies, '2026-11-27').subscribe((value) => (section = value));
      return section as { status: string; data?: { registers: unknown[]; outcomes: unknown[] } };
    };

    it('treats a cashier with no cash movement as not opened without calling the API', () => {
      expect(run([])).toEqual({ status: 'ready', data: { registers: [], outcomes: [] } });
      expect(base.getCashierClosingContext).not.toHaveBeenCalled();
    });

    it('reads the register state of each currency separately and de-duplicates currencies', () => {
      base.getCashierClosingContext.mockImplementation((_id: number, currency: string) =>
        of(context({ currencyCode: currency, registerStatus: currency === 'MXN' ? 'OPEN' : 'NOT_OPENED' }))
      );

      const section = run([
        'mxn',
        'MXN',
        'usd'
      ]);

      expect(base.getCashierClosingContext).toHaveBeenCalledTimes(2);
      expect(section.data?.registers).toEqual([
        { currencyCode: 'MXN', state: 'open', closingId: null },
        { currencyCode: 'USD', state: 'not-opened', closingId: null }
      ]);
    });

    it('discards a context that belongs to another cashier, date or currency', () => {
      base.getCashierClosingContext.mockImplementation((_id: number, currency: string) =>
        of(
          currency === 'MXN'
            ? context({ cashierId: 99 })
            : currency === 'USD'
              ? context({ currencyCode: 'USD', businessDate: '2026-11-26' })
              : context({ currencyCode: 'USD' })
        )
      );

      const states = run([
        'MXN',
        'USD',
        'EUR'
      ]).data?.registers;

      expect(states).toEqual([
        { currencyCode: 'MXN', state: 'unknown', closingId: null },
        { currencyCode: 'USD', state: 'unknown', closingId: null },
        { currencyCode: 'EUR', state: 'unknown', closingId: null }
      ]);
    });

    it('keeps the answered currencies when only some lookups fail', () => {
      base.getCashierClosingContext.mockImplementation((_id: number, currency: string) =>
        currency === 'MXN' ? of(context()) : throwError(() => httpError(500))
      );

      expect(
        run([
          'MXN',
          'USD'
        ]).data?.registers
      ).toEqual([
        { currencyCode: 'MXN', state: 'open', closingId: null },
        { currencyCode: 'USD', state: 'unknown', closingId: null }
      ]);
    });

    it('fails the section when every lookup fails', () => {
      base.getCashierClosingContext.mockReturnValue(throwError(() => httpError(403)));

      expect(run(['MXN'])).toEqual({ status: 'forbidden' });
    });

    it('loads the closing receipt of a completed register for its difference', () => {
      base.getCashierClosingContext.mockReturnValue(
        of(context({ status: 'COMPLETED', registerStatus: 'COMPLETED', closingId: 12 }))
      );
      base.getCashierClosing.mockReturnValue(
        of({
          cashierId: 31,
          businessDate: '2026-11-27',
          currencyCode: 'MXN',
          difference: -20,
          differenceType: 'SHORTAGE',
          authorizedOn: '2026-11-27T17:00:00Z'
        } as CashierClosingReceipt)
      );

      expect(run(['MXN']).data).toEqual({
        registers: [{ currencyCode: 'MXN', state: 'completed', closingId: 12 }],
        outcomes: [
          { currencyCode: 'MXN', difference: -20, differenceType: 'SHORTAGE', authorizedOn: '2026-11-27T17:00:00Z' }
        ]
      });
      expect(base.getCashierClosing).toHaveBeenCalledWith(12, { localErrors: true });
    });

    it('does not let a failed or foreign closing receipt hide the register state', () => {
      base.getCashierClosingContext.mockReturnValue(
        of(context({ status: 'COMPLETED', registerStatus: 'COMPLETED', closingId: 12 }))
      );
      base.getCashierClosing.mockReturnValue(throwError(() => httpError(500)));
      expect(run(['MXN']).data).toMatchObject({ registers: [{ state: 'completed' }], outcomes: [] });

      base.getCashierClosing.mockReturnValue(of({ cashierId: 99, businessDate: '2026-11-27', currencyCode: 'MXN' }));
      expect(run(['MXN']).data).toMatchObject({ outcomes: [] });
    });

    describe('registerFromContext', () => {
      it.each([
        [
          { status: 'OPEN', registerStatus: 'OPEN' },
          'open'
        ],
        [
          { status: 'OPEN', registerStatus: 'NOT_OPENED' },
          'not-opened'
        ],
        [
          { status: 'COMPLETED', registerStatus: 'COMPLETED' },
          'completed'
        ],
        [
          { status: 'OPEN', registerStatus: 'COMPLETED' },
          'unknown'
        ],
        [
          { status: 'COMPLETED', registerStatus: 'OPEN' },
          'unknown'
        ],
        [
          { status: 'OPEN', registerStatus: undefined },
          'unknown'
        ]
      ])('maps %j to %s (fails closed on inconsistent or legacy answers)', (partial, expected) => {
        expect(registerFromContext(context(partial as Partial<CashierClosingContext>))).toBe(expected);
      });
    });
  });

  describe('history', () => {
    it('asks for the whole business day of exactly one cashier, newest first', () => {
      history.search.mockReturnValue(
        of({ items: [], totalFilteredRecords: 0, offset: 0, limit: 500, totalsByCurrency: [] })
      );
      service.loadHistory('31', '2026-11-27').subscribe();

      expect(history.search).toHaveBeenCalledWith(
        {
          tellerId: 31,
          fromDate: '2026-11-27',
          toDate: '2026-11-27',
          sort: 'transactionDate',
          order: 'DESC',
          offset: 0,
          limit: WORKSPACE_HISTORY_LIMIT
        },
        { localErrors: true }
      );
      expect(WORKSPACE_HISTORY_LIMIT).toBe(500);
    });

    it('returns a ready section for a valid page', () => {
      const result: TransactionHistorySearch = {
        items: [],
        totalFilteredRecords: 0,
        offset: 0,
        limit: 500,
        totalsByCurrency: []
      };
      history.search.mockReturnValue(of(result));
      let section: unknown;
      service.loadHistory(31, '2026-11-27').subscribe((value) => (section = value));

      expect(section).toEqual({ status: 'ready', data: result });
    });

    it.each([
      [
        403,
        'forbidden'
      ],
      [
        500,
        'error'
      ]
    ])('maps HTTP %s to %s', (status, expected) => {
      history.search.mockReturnValue(throwError(() => httpError(status)));
      let section: unknown;
      service.loadHistory(31, '2026-11-27').subscribe((value) => (section = value));

      expect(section).toEqual({ status: expected });
    });

    it('rejects a malformed page instead of showing it', () => {
      history.search.mockReturnValue(of({ items: 'nope' }));
      let section: unknown;
      service.loadHistory(31, '2026-11-27').subscribe((value) => (section = value));

      expect(section).toEqual({ status: 'error' });
    });
  });
});
