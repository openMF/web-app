/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FineractId } from '../base-teller.service';
import { CashHolding } from '../cash-management/cash-management.models';
import { TransactionHistoryItem, TransactionHistorySearch } from '../transaction-history/transaction-history.models';
import { RegisterState } from './base-teller-workflows';
import { CurrencyRegister } from './teller-workspace.models';
import {
  Decimal,
  absDecimal,
  addDecimal,
  compareDecimal,
  decimalToString,
  floorPercent,
  isNegativeDecimal,
  isZeroDecimal,
  negateDecimal,
  subtractDecimal,
  toDecimal
} from './teller-decimal';

/** Number of recent operations shown in the side panel. */
export const RECENT_OPERATION_COUNT = 5;

/**
 * Cash-movement summary for one currency of one cashier, on the backend's own basis.
 *
 * The backend computes (`CashManagementPlatformServiceImpl#context`):
 *   expected = opening + inflows − outflows − settlements (+ eligible checks)
 * and publishes `currentBalance` as expected minus the eligible checks, i.e. cash only. So the cash-only expected figure
 * is `opening + inflows − outflows − settlements`. Settlements and deposits are SUBTRACTED and must not be ignored.
 * Comparing `currentBalance` with the closing context's `expectedAmount` would be a basis mismatch (it includes
 * checks) and would report a false difference, so this module never does that.
 */
export interface MovementSummary {
  currencyCode: string;
  openingFunds: Decimal;
  inflows: Decimal;
  outflows: Decimal;
  settlements: Decimal;
  expectedCash: Decimal;
  cashOnHand: Decimal;
  /** `cashOnHand − expectedCash`. Zero when the figures reconcile. */
  difference: Decimal;
  /** Whole percent of inflows within inflows + outflows, for the comparison bar. `null` when there is no movement. */
  inflowShare: number | null;
}

/**
 * Builds the movement summary. Returns `null` when any figure is missing or malformed so the UI shows "unavailable"
 * instead of a misleading zero.
 */
export function buildMovement(holding: CashHolding): MovementSummary | null {
  const openingFunds = toDecimal(holding.openingFunds);
  const inflows = toDecimal(holding.inflows);
  const outflows = toDecimal(holding.outflows);
  const settlements = toDecimal(holding.settlementsAndDeposits);
  const cashOnHand = toDecimal(holding.currentBalance);
  if (!openingFunds || !inflows || !outflows || !settlements || !cashOnHand) {
    return null;
  }
  const expectedCash = subtractDecimal(subtractDecimal(addDecimal(openingFunds, inflows), outflows), settlements);
  const movement = addDecimal(inflows, outflows);
  return {
    currencyCode: holding.currencyCode.trim().toUpperCase(),
    openingFunds,
    inflows,
    outflows,
    settlements,
    expectedCash,
    cashOnHand,
    difference: subtractDecimal(cashOnHand, expectedCash),
    inflowShare: isZeroDecimal(movement) || isNegativeDecimal(movement) ? null : floorPercent(inflows, movement)
  };
}

/**
 * Keeps only holdings that belong to the selected cashier and business date. A row for anyone else is never shown as
 * the current session; `mismatched` tells the caller something unexpected came back.
 */
export function matchingHoldings(
  holdings: readonly CashHolding[],
  cashierId: FineractId,
  businessDate: string
): { rows: CashHolding[]; mismatched: boolean } {
  const rows = holdings.filter(
    (holding) => String(holding.cashierId) === String(cashierId) && holding.businessDate === businessDate
  );
  return { rows, mismatched: rows.length !== holdings.length };
}

/** Operation codes that move cash inside the cashier's own register rather than serving a customer. */
const INTERNAL_OPERATIONS = new Set([
  'ALLOCATE_CASH',
  'CASH_ALLOCATION',
  'CASH_SETTLEMENT',
  'CLOSE_CASHIER'
]);
const OPENING_CONCEPTS = new Set([
  'HEAD_CASHIER_ALLOCATION',
  'OPERATIONAL_TELLER_ALLOCATION'
]);

export interface HistoryFacts {
  /** Backend count of recorded history rows for this cashier and business date. */
  operationsToday: number;
  /** Earliest completed drawer allocation of the day: the real "opening" event. Null when unknown. */
  openedAt: string | null;
  /** Latest completed cashier closing of the day: the recorded cash-count event. Null when none. */
  lastCountAt: string | null;
  /** Customer-facing operations that brought cash in / took cash out. Null when history was truncated. */
  inflowCount: number | null;
  outflowCount: number | null;
  /** True when every row of the day was loaded (not truncated by the page limit). */
  complete: boolean;
}

function timeOf(item: TransactionHistoryItem): number {
  const time = Date.parse(item.transactionDate);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function positive(value: number | string | null | undefined): boolean {
  const decimal = toDecimal(value);
  return decimal !== null && decimal.units > 0n;
}

/**
 * Derives workspace facts from one history page of the cashier's business day.
 *
 * Opening and count timestamps come from recorded events (cash allocation and cashier closing rows) instead of a
 * schedule or a guess. When the page was truncated, anything that needs the full day is reported as unknown.
 */
export function deriveHistoryFacts(search: TransactionHistorySearch): HistoryFacts {
  const items = search.items;
  const complete = items.length >= search.totalFilteredRecords;
  const openings = items.filter(
    (item) =>
      item.historyId.startsWith('CASH_ALLOCATION:') &&
      item.operation === 'ALLOCATE_CASH' &&
      item.status === 'COMPLETED' &&
      OPENING_CONCEPTS.has(item.concept) &&
      positive(item.inflow)
  );
  const closings = items.filter((item) => item.historyId.startsWith('CASHIER_CLOSING:') && item.status === 'COMPLETED');
  const earliest = openings.length ? openings.reduce((a, b) => (timeOf(a) <= timeOf(b) ? a : b)) : null;
  const latest = closings.length ? closings.reduce((a, b) => (timeOf(a) >= timeOf(b) ? a : b)) : null;
  const customerRows = items.filter((item) => !INTERNAL_OPERATIONS.has(item.operation));
  return {
    operationsToday: search.totalFilteredRecords,
    openedAt: complete && earliest ? earliest.transactionDate : null,
    lastCountAt: latest ? latest.transactionDate : null,
    inflowCount: complete ? customerRows.filter((item) => positive(item.inflow)).length : null,
    outflowCount: complete ? customerRows.filter((item) => positive(item.outflow)).length : null,
    complete
  };
}

export interface RecentOperation {
  historyId: string;
  transactionDate: string;
  operation: string;
  reference: string;
  currencyCode: string;
  decimalPlaces: number | null;
  status: string;
  direction: 'in' | 'out' | 'none';
  /** Absolute amount; the sign is carried by `direction`. Null when the backend gave no amount. */
  amount: Decimal | null;
}

/** Newest-first list of at most `limit` recorded operations. Sorting is repeated here so the order never depends on the API. */
export function recentOperations(
  items: readonly TransactionHistoryItem[],
  limit: number = RECENT_OPERATION_COUNT
): RecentOperation[] {
  return [...items]
    .sort((a, b) => timeOf(b) - timeOf(a) || b.historyId.localeCompare(a.historyId))
    .slice(0, limit)
    .map((item) => {
      const inflow = toDecimal(item.inflow);
      const outflow = toDecimal(item.outflow);
      let direction: RecentOperation['direction'] = 'none';
      let amount: Decimal | null = null;
      if (inflow && outflow) {
        const net = subtractDecimal(inflow, outflow);
        direction = isZeroDecimal(net) ? 'none' : isNegativeDecimal(net) ? 'out' : 'in';
        amount = isZeroDecimal(net) ? null : absDecimal(net);
      }
      return {
        historyId: item.historyId,
        transactionDate: item.transactionDate,
        operation: item.operation,
        reference: item.reference,
        currencyCode: (item.currencyCode ?? '').trim().toUpperCase(),
        decimalPlaces: item.decimalPlaces,
        status: item.status,
        direction,
        amount
      };
    });
}

/**
 * One state for the header across currencies. Opening is recorded per currency, so the register counts as open when
 * any currency is open; it is only "completed" when nothing is open and at least one closing is done.
 */
export function summarizeRegister(registers: readonly CurrencyRegister[] | null): RegisterState {
  if (registers === null) {
    return 'unknown';
  }
  if (registers.length === 0) {
    return 'not-opened';
  }
  const states = registers.map((register) => register.state);
  if (states.includes('open')) {
    return 'open';
  }
  if (states.includes('unknown')) {
    return 'unknown';
  }
  return states.includes('completed') ? 'completed' : 'not-opened';
}

/** Maps the backend `registerStatus` of the closing context onto the workspace state. Anything else is unknown. */
export function registerStateOf(status: string | null | undefined): RegisterState {
  switch (status) {
    case 'OPEN':
      return 'open';
    case 'NOT_OPENED':
      return 'not-opened';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'unknown';
  }
}

export function buildIdentityKey(parts: {
  tenant: string;
  userId: number | null;
  officeId: number | null;
  staffId: number | null;
  businessDate: string;
}): string {
  return [
    parts.tenant,
    parts.userId,
    parts.officeId,
    parts.staffId,
    parts.businessDate
  ].join('|');
}

/* ---------- formatting ---------- */

/** Falls back to US English when the app language is not a valid BCP 47 tag. */
export function resolveLocale(language: string | null | undefined): string {
  try {
    return Intl.NumberFormat.supportedLocalesOf(language ? [language] : []).length ? (language as string) : 'en-US';
  } catch {
    return 'en-US';
  }
}

function significantScale(value: Decimal): number {
  let { units, scale } = value;
  while (scale > 0 && units % 10n === 0n) {
    units /= 10n;
    scale -= 1;
  }
  return scale;
}

/**
 * Formats an exact decimal as currency for the given locale. The currency's own minor-unit count is the minimum, and a
 * value with finer precision (up to 6 digits) is never rounded away, so a sub-cent difference is not shown as 0.00.
 */
export function formatMoney(
  value: Decimal,
  currencyCode: string,
  locale: string,
  decimalPlaces: number | null = null
): string {
  const code = currencyCode.trim().toUpperCase();
  try {
    const base = new Intl.NumberFormat(locale, { style: 'currency', currency: code });
    const minimum = decimalPlaces ?? base.resolvedOptions().minimumFractionDigits ?? 2;
    const digits = Math.min(Math.max(minimum, significantScale(value)), 6);
    const format = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
    // A decimal string keeps every digit on engines that support string numerics; others fall back to a double.
    return format.format(decimalToString(value) as unknown as number);
  } catch {
    return `${decimalToString(value)} ${code}`;
  }
}

/** Signed variant used by the recent-operations list: `+$1,000.00` / `−$1,500.00`. */
export function formatSignedMoney(
  value: Decimal,
  direction: 'in' | 'out' | 'none',
  currencyCode: string,
  locale: string,
  decimalPlaces: number | null = null
): string {
  const text = formatMoney(absDecimal(value), currencyCode, locale, decimalPlaces);
  return direction === 'in' ? `+${text}` : direction === 'out' ? `−${text}` : text;
}

/** Locale clock time such as `13:15`, or `null` when the timestamp is invalid. */
export function formatClock(iso: string | null | undefined, locale: string, timeZone?: string): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(date);
}

/** Formats a `yyyy-MM-dd` business date without any timezone shift. */
export function formatBusinessDate(businessDate: string, locale: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(businessDate);
  if (!match) {
    return null;
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

/** Re-export used by components that need the sign helpers without importing the decimal module. */
export { compareDecimal, isNegativeDecimal, isZeroDecimal, negateDecimal };
