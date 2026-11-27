/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InjectionToken } from '@angular/core';

import { Decimal, atLeastPercent, compareDecimal, floorPercent, toDecimal } from './teller-decimal';

/**
 * Display thresholds for the teller cash-limit indicators.
 *
 * These only drive colours and the warning card. The backend remains the sole authority that enforces cash limits;
 * nothing in this module blocks or authorises a financial operation.
 */
export interface TellerCashThresholds {
  /** Progress bar turns amber at or above this percentage of the limit. */
  barWarning: number;
  /** Progress bar turns red at or above this percentage of the limit. */
  barDanger: number;
  /** The "near the cash limit" card appears at or above this percentage. */
  alertNear: number;
  /** The "cash limit exceeded" card appears at or above this percentage. */
  alertExceeded: number;
}

/** WEB-1484 defaults. Used only when no valid institution configuration is provided. */
export const DEFAULT_TELLER_CASH_THRESHOLDS: Readonly<TellerCashThresholds> = Object.freeze({
  barWarning: 70,
  barDanger: 90,
  alertNear: 80,
  alertExceeded: 100
});

export interface TellerCashLimit {
  currencyCode: string;
  /** Maximum cash allowed in the drawer, as a decimal string or number. */
  limit: number | string;
}

/**
 * Institution cash-limit configuration.
 *
 * Neither Fineract nor the savings plugin exposes a cash-limit setting today, so the default is an empty list and the
 * workspace shows "limit not configured" rather than inventing a limit. A deployment (or a future backend endpoint)
 * can provide values through this token without any component change.
 */
export interface TellerCashPolicy {
  limits: readonly TellerCashLimit[];
  thresholds?: Partial<TellerCashThresholds>;
}

export const TELLER_CASH_POLICY = new InjectionToken<TellerCashPolicy>('TELLER_CASH_POLICY', {
  providedIn: 'root',
  factory: () => ({ limits: [] })
});

function validPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Merges partial overrides over the defaults and rejects the whole override when it is not strictly ordered
 * (`0 < barWarning < barDanger`, `0 < alertNear < alertExceeded`). A broken configuration must degrade to the
 * documented defaults, never to thresholds that silently hide a breach.
 */
export function resolveThresholds(overrides?: Partial<TellerCashThresholds> | null): TellerCashThresholds {
  const merged = { ...DEFAULT_TELLER_CASH_THRESHOLDS, ...(overrides ?? {}) };
  const ordered =
    validPercent(merged.barWarning) &&
    validPercent(merged.barDanger) &&
    validPercent(merged.alertNear) &&
    validPercent(merged.alertExceeded) &&
    merged.barWarning < merged.barDanger &&
    merged.alertNear < merged.alertExceeded;
  return ordered ? merged : { ...DEFAULT_TELLER_CASH_THRESHOLDS };
}

export type CashBarLevel = 'normal' | 'warning' | 'danger';
export type CashAlertLevel = 'none' | 'near' | 'exceeded';

export type CashLimitStatus =
  | { state: 'unavailable'; reason: 'no-balance' | 'no-limit' | 'invalid-limit' }
  | {
      state: 'available';
      limit: Decimal;
      /** Whole percent, rounded down and never negative. May exceed 100. */
      percent: number;
      barLevel: CashBarLevel;
      alert: CashAlertLevel;
    };

/**
 * Evaluates one currency's cash on hand against its configured limit using exact decimal arithmetic.
 *
 * - A missing, zero, negative or malformed limit is reported as unavailable, never as "unlimited" and never as a
 *   fabricated percentage.
 * - Threshold comparisons cross-multiply, so there is no rounding error at the 70/80/90/100 boundaries.
 */
export function evaluateCashLimit(
  cashOnHand: Decimal | null,
  rawLimit: number | string | null | undefined,
  thresholds: TellerCashThresholds = DEFAULT_TELLER_CASH_THRESHOLDS
): CashLimitStatus {
  if (cashOnHand === null) {
    return { state: 'unavailable', reason: 'no-balance' };
  }
  if (rawLimit === null || rawLimit === undefined || rawLimit === '') {
    return { state: 'unavailable', reason: 'no-limit' };
  }
  const limit = toDecimal(rawLimit);
  if (limit === null || compareDecimal(limit, { units: 0n, scale: 0 }) <= 0) {
    return { state: 'unavailable', reason: 'invalid-limit' };
  }
  const reaches = (percent: number): boolean => {
    const threshold = toDecimal(percent);
    return threshold !== null && atLeastPercent(cashOnHand, limit, threshold);
  };
  const barLevel: CashBarLevel = reaches(thresholds.barDanger)
    ? 'danger'
    : reaches(thresholds.barWarning)
      ? 'warning'
      : 'normal';
  const alert: CashAlertLevel = reaches(thresholds.alertExceeded)
    ? 'exceeded'
    : reaches(thresholds.alertNear)
      ? 'near'
      : 'none';
  return { state: 'available', limit, percent: floorPercent(cashOnHand, limit) ?? 0, barLevel, alert };
}

/** Finds the configured limit for a currency, case-insensitively. Currencies are never combined. */
export function findCashLimit(policy: TellerCashPolicy, currencyCode: string): number | string | null {
  const code = currencyCode.trim().toUpperCase();
  const match = policy.limits.find((entry) => entry.currencyCode.trim().toUpperCase() === code);
  return match ? match.limit : null;
}
