/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { BaseTellerService, FineractId } from '../base-teller.service';
import {
  CashHolding,
  CashierClosingContext,
  CashierOption,
  TellerOption
} from '../cash-management/cash-management.models';
import { TransactionHistorySearch } from '../transaction-history/transaction-history.models';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { RegisterState } from './base-teller-workflows';
import {
  AssignmentResolution,
  ClosingOutcome,
  CurrencyRegister,
  RegisterSnapshot,
  Section,
  TellerAssignment,
  WorkspaceIdentity
} from './teller-workspace.models';
import { registerStateOf } from './teller-workspace.view';

/** Upper bound of the history page API; one request covers a cashier's whole business day in practice. */
export const WORKSPACE_HISTORY_LIMIT = 500;
/** Cashier look-ups run in small batches so a branch with many teller windows does not flood the API. */
const CASHIER_LOOKUP_CONCURRENCY = 4;

type CashiersResponse = { cashiers?: CashierOption[]; tellerName?: string; officeName?: string } | CashierOption[];

function toSectionFailure(error: unknown): Section<never> {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  return status === 401 || status === 403 ? { status: 'forbidden' } : { status: 'error' };
}

function tellerList(response: TellerOption[] | { pageItems?: TellerOption[] }): TellerOption[] {
  return Array.isArray(response) ? response : (response.pageItems ?? []);
}

/**
 * Mirrors `CashManagementComponent#registerStatus`: a completed closing needs both flags, and a register is only
 * "open" or "not opened" while the context itself is open.
 */
export function registerFromContext(context: CashierClosingContext): RegisterState {
  if (context.registerStatus === 'COMPLETED' && context.status === 'COMPLETED') {
    return 'completed';
  }
  if (context.status !== 'OPEN') {
    return 'unknown';
  }
  return context.registerStatus === 'OPEN' || context.registerStatus === 'NOT_OPENED'
    ? registerStateOf(context.registerStatus)
    : 'unknown';
}

/**
 * Loads the data behind the Base Teller workspace using only existing endpoints. It holds no state: the component owns
 * request ordering and cancellation, and every result is tied to the cashier and business date that was requested.
 */
@Injectable({ providedIn: 'root' })
export class TellerWorkspaceService {
  private readonly baseTeller = inject(BaseTellerService);
  private readonly history = inject(TransactionHistoryService);

  /**
   * Finds the teller windows the authenticated user is a cashier of today.
   *
   * The link is exactly user → staff → cashier: a cashier qualifies only when its `staffId` equals the signed-in
   * user's staff id. Fineract's `/tellers/{id}/cashiers` already limits results to the business date. Nothing is picked
   * "because it came first": several matches are returned so the caller can ask the user which window to use.
   *
   * Any failed look-up fails the whole resolution, because a missing teller could hide a second assignment and a
   * wrong single match must never be shown as the current session.
   */
  resolveAssignments(identity: WorkspaceIdentity): Observable<AssignmentResolution> {
    if (identity.staffId === null) {
      return of<AssignmentResolution>({ kind: 'none', reason: 'no-staff' });
    }
    const staffId = String(identity.staffId);
    return this.baseTeller.getCashManagementTellers({ localErrors: true }).pipe(
      map(tellerList),
      switchMap((tellers) => {
        if (tellers.length === 0) {
          return of<AssignmentResolution>({ kind: 'none', reason: 'no-assignment' });
        }
        return from(tellers).pipe(
          mergeMap(
            (teller) =>
              this.baseTeller
                .getCashManagementCashiers(teller.id, { localErrors: true })
                .pipe(map((response) => ({ teller, response: response as CashiersResponse }))),
            CASHIER_LOOKUP_CONCURRENCY
          ),
          toArray(),
          map((groups): AssignmentResolution => {
            const found = new Map<string, TellerAssignment>();
            for (const { teller, response } of groups) {
              const cashiers = Array.isArray(response) ? response : (response.cashiers ?? []);
              const header = Array.isArray(response) ? {} : response;
              for (const cashier of cashiers) {
                if (cashier.staffId === null || cashier.staffId === undefined || String(cashier.staffId) !== staffId) {
                  continue;
                }
                found.set(String(cashier.id), {
                  cashierId: cashier.id,
                  tellerId: cashier.tellerId ?? teller.id,
                  tellerName: cashier.tellerName ?? header.tellerName ?? teller.name ?? '',
                  cashierName: cashier.staffName ?? cashier.cashierName ?? '',
                  officeName: cashier.officeName ?? header.officeName ?? null
                });
              }
            }
            const assignments = [...found.values()].sort(
              (a, b) =>
                a.tellerName.localeCompare(b.tellerName) || String(a.cashierId).localeCompare(String(b.cashierId))
            );
            return assignments.length ? { kind: 'resolved', assignments } : { kind: 'none', reason: 'no-assignment' };
          })
        );
      }),
      catchError((error: unknown) =>
        of<AssignmentResolution>({
          kind: 'error',
          reason: toSectionFailure(error).status === 'forbidden' ? 'forbidden' : 'unavailable'
        })
      )
    );
  }

  /** Authoritative cash holdings of one cashier for the business date (one row per currency with movements). */
  loadHoldings(cashierId: FineractId, businessDate: string): Observable<Section<CashHolding[]>> {
    return this.baseTeller.getCashHoldings({ cashierId, businessDate }, { localErrors: true }).pipe(
      map((rows): Section<CashHolding[]> =>
        Array.isArray(rows) ? { status: 'ready', data: rows } : { status: 'error' }
      ),
      catchError((error: unknown) => of(toSectionFailure(error)))
    );
  }

  /**
   * Register lifecycle per currency from the backend closing context, plus the closing outcome of completed
   * registers. A cashier without any holding row has no allocation and therefore no opened register.
   */
  loadRegisters(
    cashierId: FineractId,
    currencyCodes: readonly string[],
    businessDate: string
  ): Observable<Section<RegisterSnapshot>> {
    const currencies = [...new Set(currencyCodes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
    if (currencies.length === 0) {
      return of<Section<RegisterSnapshot>>({ status: 'ready', data: { registers: [], outcomes: [] } });
    }
    return forkJoin(
      currencies.map((currencyCode) =>
        this.baseTeller.getCashierClosingContext(cashierId, currencyCode, businessDate, { localErrors: true }).pipe(
          map((context) => ({ currencyCode, context, failure: null as Section<never> | null })),
          catchError((error: unknown) =>
            of({ currencyCode, context: null as CashierClosingContext | null, failure: toSectionFailure(error) })
          )
        )
      )
    ).pipe(
      switchMap((results) => {
        if (results.every((result) => result.failure !== null)) {
          return of<Section<RegisterSnapshot>>(results[0].failure as Section<never>);
        }
        const registers: CurrencyRegister[] = results.map(({ currencyCode, context }) => {
          const belongsToRequest =
            context !== null &&
            String(context.cashierId) === String(cashierId) &&
            context.businessDate === businessDate &&
            context.currencyCode.trim().toUpperCase() === currencyCode;
          return {
            currencyCode,
            state: belongsToRequest && context ? registerFromContext(context) : 'unknown',
            closingId: belongsToRequest && context ? (context.closingId ?? null) : null
          };
        });
        const completed = registers.filter((register) => register.state === 'completed' && register.closingId !== null);
        if (completed.length === 0) {
          return of<Section<RegisterSnapshot>>({ status: 'ready', data: { registers, outcomes: [] } });
        }
        return forkJoin(
          completed.map((register) =>
            this.baseTeller.getCashierClosing(register.closingId as FineractId, { localErrors: true }).pipe(
              map((receipt): ClosingOutcome | null =>
                String(receipt.cashierId) === String(cashierId) &&
                receipt.businessDate === businessDate &&
                receipt.currencyCode.trim().toUpperCase() === register.currencyCode
                  ? {
                      currencyCode: register.currencyCode,
                      difference: receipt.difference ?? null,
                      differenceType: receipt.differenceType ?? null,
                      authorizedOn: receipt.authorizedOn ?? null
                    }
                  : null
              ),
              // The closing difference is a nice-to-have; its failure must not hide the register state.
              catchError(() => of(null))
            )
          )
        ).pipe(
          map((outcomes): Section<RegisterSnapshot> => ({
            status: 'ready',
            data: { registers, outcomes: outcomes.filter((outcome): outcome is ClosingOutcome => outcome !== null) }
          }))
        );
      })
    );
  }

  /**
   * Every recorded history row of one cashier for the business date, newest first.
   *
   * The history API's `tellerId` parameter is the cashier id (`m_cashiers.id`): the backend matches it against the
   * source/destination cashier of each row and rejects ids outside the caller's scope. See WORKSPACE-AUDIT.md.
   */
  loadHistory(cashierId: FineractId, businessDate: string): Observable<Section<TransactionHistorySearch>> {
    return this.history
      .search(
        {
          tellerId: Number(cashierId),
          fromDate: businessDate,
          toDate: businessDate,
          sort: 'transactionDate',
          order: 'DESC',
          offset: 0,
          limit: WORKSPACE_HISTORY_LIMIT
        },
        { localErrors: true }
      )
      .pipe(
        map((result): Section<TransactionHistorySearch> =>
          result && Array.isArray(result.items) && Number.isFinite(result.totalFilteredRecords)
            ? { status: 'ready', data: result }
            : { status: 'error' }
        ),
        catchError((error: unknown) => of(toSectionFailure(error)))
      );
  }
}
