/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import moment from 'moment';
import { _ as extract } from '@ngx-translate/core';
import { sanitizeCsvValue } from 'app/core/utils/csv.utils';

export const OFFICE_AUDIT_PAGE_SIZE = 25;
export const OFFICE_AUDIT_MAX_LOADED = 500;

export interface OfficeAuditEvent {
  id: string;
  resourceId: string;
  entityName: 'OFFICE';
  actionName: string;
  maker: string;
  initials: string;
  timestamp: number | null;
  checkedTimestamp: number | null;
  checker: string;
  processingResult: string;
}

export interface SubmittedOfficeField {
  key: string;
  label: string;
  value: string | null;
}

export interface OfficeAuditGroup {
  key: string;
  timestamp: number | null;
  events: OfficeAuditEvent[];
}

/** Validated identity with optional metadata still treated as untrusted until projection. */
interface DirectOfficeAuditRecord {
  id: string | number;
  resourceId: string | number;
  entityName: 'OFFICE';
  actionName?: unknown;
  maker?: unknown;
  madeOnDate?: unknown;
  checkedOnDate?: unknown;
  checker?: unknown;
  processingResult?: unknown;
  commandAsJson?: unknown;
}

/** Audit permissions are enforced even when the legacy menu RBAC switch is off. */
export function canReadOfficeAudit(credentials: { authenticated?: boolean; permissions?: string[] } | null): boolean {
  return !!credentials?.authenticated && [
      'READ_AUDIT',
      'ALL_FUNCTIONS_READ',
      'ALL_FUNCTIONS'
    ].some((permission) => credentials.permissions?.includes(permission));
}

/** Reject numeric IDs already rounded by JSON parsing rather than presenting a different identifier. */
export function auditId(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) ? value : null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Fineract numeric timestamps are epoch milliseconds; date arrays are local wall-clock fields. */
export function auditTimestamp(value: unknown): number | null {
  if (value == null || value === '') return null;
  let date;
  if (Array.isArray(value)) {
    if (value.length < 3 || value.length > 7 || !value.every((part) => Number.isInteger(part))) return null;
    const [
      year,
      month,
      day,
      hour = 0,
      minute = 0,
      second = 0
    ] = value;
    date = moment({ year, month: month - 1, date: day, hour, minute, second });
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    date = moment(value);
  } else if (typeof value === 'string') {
    date = moment(value, moment.ISO_8601, true);
  } else return null;
  return date.isValid() ? date.valueOf() : null;
}

export function isDirectOfficeAudit(row: unknown, officeId: string): row is DirectOfficeAuditRecord {
  return (
    isRecord(row) && row.entityName === 'OFFICE' && auditId(row.resourceId) === officeId && auditId(row.id) !== null
  );
}

/** Project metadata explicitly; never retain arbitrary payload properties in presentation state. */
export function normalizeOfficeAudit(row: unknown, officeId: string): OfficeAuditEvent | null {
  if (!isDirectOfficeAudit(row, officeId)) return null;
  const maker = text(row.maker);
  return {
    id: auditId(row.id),
    resourceId: officeId,
    entityName: 'OFFICE',
    actionName: text(row.actionName),
    maker,
    initials: Array.from(maker.trim()).slice(0, 2).join('').toLocaleUpperCase(),
    timestamp: auditTimestamp(row.madeOnDate),
    checkedTimestamp: auditTimestamp(row.checkedOnDate),
    checker: text(row.checker),
    processingResult: text(row.processingResult)
  };
}

export function readOfficeAuditPage(
  response: unknown,
  officeId: string,
  limit: number = OFFICE_AUDIT_PAGE_SIZE
): {
  events: OfficeAuditEvent[];
  received: number;
  total: number;
} {
  if (
    !isRecord(response) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > OFFICE_AUDIT_PAGE_SIZE ||
    !Array.isArray(response.pageItems) ||
    response.pageItems.length > limit ||
    typeof response.totalFilteredRecords !== 'number' ||
    !Number.isSafeInteger(response.totalFilteredRecords) ||
    response.totalFilteredRecords < 0 ||
    response.pageItems.some((row: unknown) => !isRecord(row))
  )
    throw new Error('Invalid audit page');
  return {
    events: response.pageItems
      .map((row: unknown) => normalizeOfficeAudit(row, officeId))
      .filter((event): event is OfficeAuditEvent => event !== null),
    received: response.pageItems.length,
    // entityName is a prefix match on the server. This total MUST NOT be shown as a branch total.
    total: response.totalFilteredRecords
  };
}

export function mergeOfficeAudits(previous: OfficeAuditEvent[], incoming: OfficeAuditEvent[]): OfficeAuditEvent[] {
  return Array.from(
    new Map(
      [
        ...previous,
        ...incoming
      ].map((event) => [
        event.id,
        event
      ])
    ).values()
  ).sort(
    (a, b) =>
      (b.timestamp ?? -Infinity) - (a.timestamp ?? -Infinity) || b.id.length - a.id.length || b.id.localeCompare(a.id)
  );
}

export function groupOfficeAudits(events: OfficeAuditEvent[]): OfficeAuditGroup[] {
  const groups = new Map<string, OfficeAuditGroup>();
  for (const event of events) {
    const key = event.timestamp === null ? 'unknown' : moment(event.timestamp).format('YYYY-MM');
    if (!groups.has(key)) groups.set(key, { key, timestamp: event.timestamp, events: [] });
    groups.get(key).events.push(event);
  }
  return [...groups.values()];
}

/** Only original, safe office command fields. Enriched names from the detail endpoint are excluded. */
const SUBMITTED_FIELDS: Record<string, string> = {
  name: 'labels.inputs.Name',
  externalId: 'labels.inputs.External Id',
  openingDate: 'labels.inputs.Opening Date',
  parentId: extract('branchHistory.parentId')
};

export function submittedOfficeFields(command: unknown): SubmittedOfficeField[] | null {
  if (typeof command !== 'string' || command.length > 32768) return null;
  try {
    const parsed: unknown = JSON.parse(command);
    if (!isRecord(parsed)) return null;
    return Object.entries(SUBMITTED_FIELDS).flatMap(
      ([
        key,
        label
      ]) => {
        if (!Object.prototype.hasOwnProperty.call(parsed, key)) return [];
        const value = parsed[key];
        // Complex values and unsafe numbers are intentionally omitted, never stringified or rounded.
        if (value !== null && typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number')
          return [];
        if (typeof value === 'number' && (!Number.isFinite(value) || !Number.isSafeInteger(value))) return [];
        if (typeof value === 'string' && value.length > 2048) return [];
        return [{ key, label, value: value === null ? null : String(value) }];
      }
    );
  } catch {
    return null;
  }
}

/** Datetime-local values remain local wall-clock fields; no implicit UTC boundary conversion. */
export function validAuditRange(from: string, to: string): boolean {
  const formats = [
    'YYYY-MM-DDTHH:mm',
    'YYYY-MM-DDTHH:mm:ss'
  ];
  const start = from ? moment(from, formats, true) : null;
  const end = to ? moment(to, formats, true) : null;
  return (!start || start.isValid()) && (!end || end.isValid()) && (!start || !end || !start.isAfter(end));
}

/** Export metadata only, from the same exact office population visible in the timeline. */
export function officeAuditCsv(events: OfficeAuditEvent[], officeId: string, headers: string[]): string {
  const cell = (value: string) => {
    // The shared sanitizer handles leading triggers; also guard triggers after leading whitespace.
    const safe = /^\s+[=+\-@|%]/.test(value) ? `'${value}` : sanitizeCsvValue(value);
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = mergeOfficeAudits([], events)
    .filter((event) => isDirectOfficeAudit(event, officeId))
    .map((event) => [
      event.id,
      officeId,
      event.entityName,
      event.actionName,
      event.maker,
      event.timestamp === null ? '' : moment(event.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      event.processingResult,
      event.checker,
      event.checkedTimestamp === null ? '' : moment(event.checkedTimestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    ]);
  return (
    '\uFEFF' +
    [
      headers,
      ...rows
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
  );
}
