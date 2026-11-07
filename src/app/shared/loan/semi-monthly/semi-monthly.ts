/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** `periodFrequencyType.semiMonthly` — id of the semi-monthly repayment frequency (FINERACT-1322). */
export const SEMI_MONTHLY_FREQUENCY_TYPE = 6;

/** Lowest day of month the first semi-monthly due day can be set to. */
export const SEMI_MONTHLY_MIN_FIRST_DAY = 1;
/**
 * Highest day of month the first semi-monthly due day can be set to. It stops at 27 so that a second
 * day capped to the 28th of a non-leap February never lands on the first one.
 */
export const SEMI_MONTHLY_MAX_FIRST_DAY = 27;
/** Lowest day of month the second semi-monthly due day can be set to. */
export const SEMI_MONTHLY_MIN_SECOND_DAY = 2;
/** Highest second due day; a month that lacks it falls on its last day, so 31 means "last day of the month". */
export const SEMI_MONTHLY_LAST_DAY_OF_MONTH = 31;

/** Error key set by {@link semiMonthlyDueDateValidator} when a date is not a configured due day. */
export const SEMI_MONTHLY_DUE_DAY_ERROR = 'semiMonthlyDueDay';

/** The two configured due days of a semi-monthly product or loan. */
export interface SemiMonthlyRepaymentDays {
  firstRepaymentDayOfMonth: number;
  secondRepaymentDayOfMonth: number;
}

/** True when the given frequency type (id or option object) is the semi-monthly one. */
export function isSemiMonthly(frequencyType: unknown): boolean {
  const id = typeof frequencyType === 'object' && frequencyType !== null ? (frequencyType as any).id : frequencyType;
  return Number(id) === SEMI_MONTHLY_FREQUENCY_TYPE;
}

/** True when the value is an integer within the 1–27 window the backend accepts for the first day. */
export function isValidFirstRepaymentDay(firstDay: unknown): boolean {
  const day = Number(firstDay);
  return Number.isInteger(day) && day >= SEMI_MONTHLY_MIN_FIRST_DAY && day <= SEMI_MONTHLY_MAX_FIRST_DAY;
}

/** True when both days are valid: first within 1–27, second within 2–31 and strictly after the first. */
export function isValidRepaymentDayPair(firstDay: unknown, secondDay: unknown): boolean {
  const second = Number(secondDay);
  return (
    isValidFirstRepaymentDay(firstDay) &&
    Number.isInteger(second) &&
    second <= SEMI_MONTHLY_LAST_DAY_OF_MONTH &&
    second > Number(firstDay)
  );
}

/** The days the second due day can take for a given first day: the day after it up to 31. */
export function secondRepaymentDayOptions(firstDay: unknown): number[] {
  const first = Number(firstDay);
  const from = isValidFirstRepaymentDay(first) ? first + 1 : SEMI_MONTHLY_MIN_SECOND_DAY;
  return Array.from({ length: SEMI_MONTHLY_LAST_DAY_OF_MONTH - from + 1 }, (_, index) => from + index);
}

/** The days the first due day can take: 1 to 27. */
export function firstRepaymentDayOptions(): number[] {
  return Array.from({ length: SEMI_MONTHLY_MAX_FIRST_DAY }, (_, index) => index + SEMI_MONTHLY_MIN_FIRST_DAY);
}

/** Number of days in the given month (`month` is 1-based). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * The actual second due day of a concrete month (`month` is 1-based): the configured day, capped at
 * that month's last day — so 31 gives 28/29 in February and 30 in April. The first day needs no
 * capping because it never exceeds 27.
 */
export function secondDayIn(secondDay: number, year: number, month: number): number {
  return Math.min(secondDay, daysInMonth(year, month));
}

/** True when the date falls on the first day or on the (capped) second day of its month. */
export function isSemiMonthlyDueDate(date: Date, days: SemiMonthlyRepaymentDays): boolean {
  const { firstRepaymentDayOfMonth: first, secondRepaymentDayOfMonth: second } = days;
  if (!isValidRepaymentDayPair(first, second) || Number.isNaN(date.getTime())) {
    return false;
  }
  const dayOfMonth = date.getDate();
  return dayOfMonth === first || dayOfMonth === secondDayIn(second, date.getFullYear(), date.getMonth() + 1);
}

/**
 * Coerces a datepicker control value to a `Date`. Returns `null` for blank or unparseable values so
 * callers skip validation instead of rejecting input they cannot interpret.
 */
function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof (value as any).toDate === 'function') {
    return toDate((value as any).toDate());
  }
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Validator for a "first repayment on" date: when the loan is semi-monthly, the date must be one of
 * the two configured due days of its month. `daysProvider` returns the configured pair, or `null`
 * when the loan is not semi-monthly or the pair is incomplete (the validator then passes).
 */
export function semiMonthlyDueDateValidator(daysProvider: () => SemiMonthlyRepaymentDays | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const days = daysProvider();
    const date = toDate(control.value);
    if (
      days === null ||
      date === null ||
      !isValidRepaymentDayPair(days.firstRepaymentDayOfMonth, days.secondRepaymentDayOfMonth)
    ) {
      return null;
    }
    return isSemiMonthlyDueDate(date, days) ? null : { [SEMI_MONTHLY_DUE_DAY_ERROR]: true };
  };
}

/**
 * Removes the pair from a request payload unless it must be sent: the backend rejects the days on any
 * frequency other than semi-monthly, and either both days travel together or neither does. When
 * `baseline` is given (the days the product or the loan already has), an unchanged pair is omitted
 * too, so the backend keeps the stored days.
 */
export function applyRepaymentDaysToPayload(
  payload: Record<string, any>,
  frequencyType: unknown,
  baseline?: Partial<SemiMonthlyRepaymentDays> | null
): void {
  const first = payload.firstRepaymentDayOfMonth;
  const second = payload.secondRepaymentDayOfMonth;
  const unchanged =
    baseline != null && first === baseline.firstRepaymentDayOfMonth && second === baseline.secondRepaymentDayOfMonth;
  if (!isSemiMonthly(frequencyType) || first == null || second == null || unchanged) {
    delete payload.firstRepaymentDayOfMonth;
    delete payload.secondRepaymentDayOfMonth;
  }
}
