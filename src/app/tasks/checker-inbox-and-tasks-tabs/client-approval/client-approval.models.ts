/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface PendingClient {
  id: number;
  accountNo: string;
  displayName: string;
  officeId?: number;
  officeName?: string;
  staffId?: number | null;
  staffName?: string;
  active?: boolean;
  status?: { id?: number; code?: string; value?: string };
  submittedOnDate?: string | number[];
  timeline?: { submittedOnDate?: string | number[] };
}

export interface ClientScope {
  officeId?: number;
  staffId?: number;
  displayName?: string;
}

export interface ClientSnapshot {
  rows: PendingClient[];
  total: number | null;
  complete: boolean;
}

export type CommandOutcome = 'succeeded' | 'failed' | 'uncertain';
export interface ClientApprovalOutcome {
  client: PendingClient;
  activation: CommandOutcome;
  assignment?: CommandOutcome;
}

export function pendingClient(client: PendingClient): boolean {
  return (
    Number.isSafeInteger(client.id) &&
    client.id > 0 &&
    client.active !== true &&
    (client.status?.id === 100 || client.status?.code === 'clientStatusType.pending')
  );
}

/** Strict calendar parsing: never substitute activation dates or normalize impossible dates. */
export function clientCalendarDate(value: unknown): Date | null {
  let parts: number[];
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isInteger)) {
    parts = value;
  } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    parts = value.split('-').map(Number);
  } else {
    return null;
  }
  const [
    year,
    month,
    day
  ] = parts;
  const result = new Date(year, month - 1, day);
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day ? result : null;
}

export function submissionDate(client: PendingClient): Date | null {
  return clientCalendarDate(client.submittedOnDate ?? client.timeline?.submittedOnDate);
}

export function calendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

export function waitingDays(client: PendingClient, businessDate: Date): number | null {
  const date = submissionDate(client);
  const days = date ? calendarDay(businessDate) - calendarDay(date) : null;
  return days !== null && days >= 0 ? days : null;
}

export function staffState(client: PendingClient): 'assigned' | 'unassigned' | 'unknown' {
  if (Number.isSafeInteger(client.staffId) && client.staffId > 0) return 'assigned';
  if (client.staffName?.trim()) return 'assigned';
  // Fineract's full ClientData listing omits null staff fields. A null/absent ID and name
  // both signify no assignment; malformed IDs are unknown rather than unassigned.
  return client.staffId == null ? 'unassigned' : 'unknown';
}

export function nameWarning(name: string): boolean {
  return /\s{2,}|\s[.,;:]\s*$/.test(name ?? '');
}

/** An HTTP success alone cannot settle missing, duplicated, accepted, or checker-held commands. */
export function batchOutcome(responses: unknown, requestId: number): CommandOutcome {
  if (!Array.isArray(responses)) return 'uncertain';
  const matches = responses.filter((response) => String(response?.requestId) === String(requestId));
  if (matches.length !== 1) return 'uncertain';
  const response = matches[0];
  const status = Number(response.statusCode);
  if (!Number.isInteger(status) || status < 200 || status >= 500 || status === 408 || status === 202)
    return 'uncertain';
  if (status >= 300) return 'failed';
  let body = response.body;
  if (typeof body === 'string' && body) {
    try {
      body = JSON.parse(body);
    } catch {
      return 'uncertain';
    }
  }
  if (body?.commandId && !body?.resourceId) return 'uncertain';
  return 'succeeded';
}
