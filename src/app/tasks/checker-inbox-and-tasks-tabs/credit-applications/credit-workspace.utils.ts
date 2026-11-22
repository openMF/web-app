/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
import moment from 'moment';
import { sanitizeCsvValue } from 'app/core/utils/csv.utils';

export const CREDIT_STATUSES: Record<number, { key: string; tone: string }> = {
  100: { key: extract('credits.pending'), tone: 'pending' },
  200: { key: 'labels.inputs.Approved', tone: 'approved' },
  300: { key: 'labels.status.Active', tone: 'active' },
  400: { key: 'labels.inputs.Withdrawn by applicant', tone: 'neutral' },
  500: { key: 'labels.inputs.Rejected', tone: 'rejected' },
  600: { key: 'labels.status.Closed', tone: 'neutral' },
  601: { key: 'labels.status.Closed (written off)', tone: 'neutral' },
  602: { key: 'labels.status.Closed (rescheduled)', tone: 'neutral' },
  700: { key: 'labels.status.Overpaid', tone: 'neutral' },
  303: { key: 'labels.status.Transfer in progress', tone: 'neutral' },
  304: { key: 'labels.status.Transfer on hold', tone: 'neutral' }
};

export function creditStatusId(application: any): number {
  const status = application?.status;
  const codeIds: Record<string, number> = {
    'loanStatusType.submitted.and.pending.approval': 100,
    'loanStatusType.approved': 200,
    'loanStatusType.active': 300,
    'loanStatusType.withdrawn.by.applicant': 400,
    'loanStatusType.withdrawn.by.client': 400,
    'loanStatusType.rejected': 500,
    'loanStatusType.closed.obligations.met': 600
  };
  return Number(status?.id ?? application?.statusId ?? codeIds[status?.code]);
}

/** Compare nonnegative decimal strings without converting money to floating point. */
export function compareCreditAmounts(left: unknown, right: unknown): number {
  const parts = (value: unknown) => {
    const [
      integer,
      fraction = ''
    ] = String(value).split('.');
    return [
      integer.replace(/^0+(?=\d)/, ''),
      fraction
    ];
  };
  const [
    li,
    lf
  ] = parts(left);
  const [
    ri,
    rf
  ] = parts(right);
  if (li.length !== ri.length) return li.length > ri.length ? 1 : -1;
  const width = Math.max(lf.length, rf.length);
  const l = li + lf.padEnd(width, '0');
  const rr = ri + rf.padEnd(width, '0');
  return l === rr ? 0 : l > rr ? 1 : -1;
}

export function creditFilterError(value: any): string {
  const from = value.submittedFrom;
  const to = value.submittedTo;
  if ((from && !moment(from).isValid()) || (to && !moment(to).isValid())) return extract('credits.invalidDate');
  if (from && to && moment(from).isAfter(moment(to), 'day')) return 'labels.text.From Date cannot be after To Date';
  const hasAmount = (amount: unknown) => amount !== '' && amount !== null && amount !== undefined;
  const min = hasAmount(value.minAmount);
  const max = hasAmount(value.maxAmount);
  for (const amount of [
    value.minAmount,
    value.maxAmount
  ]) {
    if (!hasAmount(amount)) continue;
    if (String(amount).startsWith('-')) return 'labels.text.Amounts cannot be negative';
    if (!/^\d+(\.\d+)?$/.test(String(amount))) return extract('credits.invalidAmount');
  }
  if (min && max && compareCreditAmounts(value.minAmount, value.maxAmount) > 0)
    return 'labels.text.Minimum Amount cannot be greater than Maximum Amount';
  if ((min || max) && !value.currencyCode) return extract('credits.currencyRequired');
  return '';
}

export function creditCalendarDate(value: any): moment.Moment {
  return Array.isArray(value) ? moment({ year: value[0], month: value[1] - 1, date: value[2] }) : moment(value);
}

/** Quotes every cell and neutralizes formulas, including whitespace-prefixed formulas. */
export function creditCsvCell(value: unknown, account = false): string {
  let text = value == null ? '' : String(value);
  if (/^\s+[=+\-@|%]/.test(text) || /^\n/.test(text) || (account && /^0\d/.test(text))) text = "'" + text;
  else text = sanitizeCsvValue(text);
  return '"' + text.replace(/"/g, '""') + '"';
}
