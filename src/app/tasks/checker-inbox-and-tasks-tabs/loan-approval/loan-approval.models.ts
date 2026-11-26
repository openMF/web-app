/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { decimal } from 'app/products/saving-products/product-editor/interest-rate.model';

export interface ApprovalLoan {
  id: number;
  accountNo: string;
  clientId?: number;
  clientName?: string;
  clientOfficeId?: number;
  group?: { id?: number; name?: string; officeId?: number };
  loanType?: { id?: number };
  loanProductId?: number;
  loanProductName?: string;
  loanPurposeName?: string | number | boolean | null;
  principal: string;
  currency?: { code: string; decimalPlaces: number };
  status?: { id?: number; pendingApproval?: boolean; waitingForDisbursal?: boolean; active?: boolean };
  timeline?: { submittedOnDate?: unknown; expectedDisbursementDate?: unknown };
  expectedDisbursementDate?: unknown;
  multiDisburseLoan?: boolean;
  isTopup?: boolean;
  isLoanProductLinkedToFloatingRate?: boolean;
  disbursementDetails?: unknown[];
}
export interface ApprovalSnapshot {
  rows: ApprovalLoan[];
  total: number | null;
  complete: boolean;
}
export interface MoneyTotal {
  code: string;
  digits: number;
  amount: string;
}
export type ApprovalOutcome = 'approved' | 'review' | 'failed' | 'uncertain';
export interface ApprovalResult {
  loan: ApprovalLoan;
  outcome: ApprovalOutcome;
}
export interface ApprovalReview {
  fingerprint: string;
  loan: ApprovalLoan;
  amount: string;
  submitted: Date;
  expected: Date;
}

export function pendingLoan(loan: ApprovalLoan): boolean {
  return (
    loan?.status?.pendingApproval === true && loan.status.id === 100 && Number.isSafeInteger(loan.id) && loan.id > 0
  );
}
export function officeId(loan: ApprovalLoan): number | undefined {
  return loan.clientOfficeId ?? loan.group?.officeId;
}
export function missingPurpose(loan: ApprovalLoan): boolean {
  return loan.loanPurposeName == null || (typeof loan.loanPurposeName === 'string' && !loan.loanPurposeName.trim());
}
/** Financial values stay as decimal text from the HTTP boundary; no binary floating-point sums. */
export function minorUnits(amount: unknown, digits: number): bigint | null {
  if (!Number.isInteger(digits) || digits < 0 || digits > 12 || !decimal(amount, digits, false, true)) return null;
  const [
    whole,
    fraction = ''
  ] = amount.split('.');
  return BigInt(whole) * 10n ** BigInt(digits) + BigInt(fraction.slice(0, digits).padEnd(digits, '0') || '0');
}
export function decimalAmount(units: bigint, digits: number): string {
  const text = units.toString().padStart(digits + 1, '0');
  return digits ? text.slice(0, -digits) + '.' + text.slice(-digits) : text;
}
export function totals(loans: ApprovalLoan[]): MoneyTotal[] | null {
  const sums = new Map<string, { code: string; digits: number; units: bigint }>();
  for (const loan of loans) {
    const { code, decimalPlaces: digits } = loan.currency ?? {};
    const units = minorUnits(loan.principal, digits);
    if (!code || units === null) return null;
    const key = code + ':' + digits;
    const sum = sums.get(key) ?? { code, digits, units: 0n };
    sum.units += units;
    sums.set(key, sum);
  }
  return [...sums.values()].map((sum) => ({
    code: sum.code,
    digits: sum.digits,
    amount: decimalAmount(sum.units, sum.digits)
  }));
}
export function highValue(loan: ApprovalLoan): boolean {
  if (loan.currency?.code !== 'MXN') return false;
  const digits = loan.currency.decimalPlaces;
  const units = minorUnits(loan.principal, digits);
  return units !== null && units >= 1000000n * 10n ** BigInt(digits);
}
export function calendarDate(value: unknown): Date | null {
  const parts = Array.isArray(value)
    ? value
    : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value.split('-').map(Number)
      : [];
  if (parts.length !== 3 || !parts.every(Number.isInteger)) return null;
  const [
    year,
    month,
    day
  ] = parts;
  const result = new Date(year, month - 1, day);
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day ? result : null;
}
export function day(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}
/** Only the standard single-disbursement workflow is representable in the shared date toolbar. */
export function reviewLoan(loan: ApprovalLoan, detail: ApprovalLoan, template: any): ApprovalReview | null {
  const submitted = calendarDate(detail.timeline?.submittedOnDate);
  const expected = calendarDate(
    template?.expectedDisbursementDate ?? detail.timeline?.expectedDisbursementDate ?? detail.expectedDisbursementDate
  );
  const units = minorUnits(template?.approvalAmount, detail.currency?.decimalPlaces);
  if (
    !pendingLoan(detail) ||
    detail.id !== loan.id ||
    typeof detail.accountNo !== 'string' ||
    !detail.accountNo.trim() ||
    (!Number.isSafeInteger(detail.clientId) && !Number.isSafeInteger(detail.group?.id)) ||
    detail.group?.id !== loan.group?.id ||
    detail.loanProductId !== loan.loanProductId ||
    detail.accountNo !== loan.accountNo ||
    detail.clientId !== loan.clientId ||
    officeId(detail) !== officeId(loan) ||
    detail.multiDisburseLoan !== false ||
    ![
      1,
      2,
      3
    ].includes(detail.loanType?.id) ||
    detail.isTopup ||
    detail.disbursementDetails?.length ||
    detail.isLoanProductLinkedToFloatingRate ||
    template?.discountAmount != null ||
    !submitted ||
    !expected ||
    units === null ||
    units <= 0n ||
    detail.currency?.code !== loan.currency?.code ||
    detail.currency?.decimalPlaces !== loan.currency?.decimalPlaces ||
    minorUnits(detail.principal, detail.currency?.decimalPlaces) !== units ||
    minorUnits(loan.principal, loan.currency?.decimalPlaces) !== units
  )
    return null;
  // Capture immutable read data; a later response (or an in-place update) must not silently replace this review.
  const fingerprint = JSON.stringify({ detail, template }, (_key, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [
              key,
              value[key]
            ])
        )
      : value
  );
  return { loan: detail, amount: template.approvalAmount, submitted, expected, fingerprint };
}
/** Fineract IDs are positive Java Long values, represented as JSON numbers or decimal strings. */
function apiId(value: unknown): bigint | null {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? BigInt(value) : null;
  if (typeof value !== 'string' || !/^[0-9]{1,19}$/.test(value)) return null;
  const id = BigInt(value);
  return id > 0n && id <= 9223372036854775807n ? id : null;
}
/** Missing, duplicated, malformed and server-error items never become safe retry candidates. */
export function commandOutcome(response: unknown, requestId: number, loanId: number): ApprovalOutcome {
  if (!Array.isArray(response)) return 'uncertain';
  const matches = response.filter((item) => String(item?.requestId) === String(requestId));
  if (matches.length !== 1) return 'uncertain';
  const item = matches[0];
  const status = Number(item.statusCode);
  if (!Number.isInteger(status) || status < 200 || status >= 500 || status === 408 || status === 202)
    return 'uncertain';
  if (status >= 300 && status < 400) return 'uncertain';
  if (status >= 400) return 'failed';
  let body = item.body;
  try {
    if (typeof body === 'string') body = JSON.parse(body);
  } catch {
    return 'uncertain';
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'uncertain';
  const commandId = apiId(body.commandId);
  const resourceId = apiId(body.resourceId);
  if ((body.commandId != null && commandId === null) || (body.resourceId != null && resourceId === null))
    return 'uncertain';
  if (commandId !== null && body.resourceId == null) return 'review';
  return resourceId !== null && resourceId === apiId(loanId) && !body.rollbackTransaction ? 'approved' : 'uncertain';
}
