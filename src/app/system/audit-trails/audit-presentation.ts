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
export {
  auditId,
  auditTimestamp,
  canReadOfficeAudit as canReadAudit,
  validAuditRange
} from 'app/organization/offices/view-office/change-history-tab/office-audit';
import { auditId, auditTimestamp } from 'app/organization/offices/view-office/change-history-tab/office-audit';

export interface AuditEvent {
  id: string;
  resourceId: string;
  actionName: string;
  entityName: string;
  maker: string;
  checker: string;
  officeName: string;
  clientName?: string;
  savingsAccountNo?: string;
  groupLevelName?: string;
  processingResult: string;
  timestamp: number | null;
  checkedTimestamp: number | null;
  ip: string;
}
const text = (value: unknown): string => (typeof value === 'string' ? value : '');
function validIp(value: unknown): string {
  if (typeof value !== 'string') return '';
  const ip = value.trim();
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every((part) => Number(part) <= 255)) return ip;
  if (/^[0-9a-f:.]+$/i.test(ip) && ip.includes(':')) {
    try {
      new URL('http://[' + ip + ']/');
      return ip;
    } catch {
      return '';
    }
  }
  return '';
}
export function auditEvent(row: unknown): AuditEvent {
  if (!isRecord(row) || !auditId(row.id)) throw new Error('Invalid audit identity');
  return {
    id: auditId(row.id),
    resourceId: auditId(row.resourceId) ?? '',
    actionName: text(row.actionName),
    entityName: text(row.entityName),
    maker: text(row.maker),
    checker: text(row.checker).trim(),
    officeName: text(row.officeName),
    clientName: text(row.clientName),
    savingsAccountNo: text(row.savingsAccountNo),
    groupLevelName: text(row.groupLevelName),
    processingResult: text(row.processingResult),
    timestamp: auditTimestamp(row.madeOnDate),
    checkedTimestamp: auditTimestamp(row.checkedOnDate),
    ip: validIp(row.ip)
  };
}
export function auditPage(response: unknown, limit: number): { events: AuditEvent[]; total: number } {
  if (
    !isRecord(response) ||
    !Array.isArray(response.pageItems) ||
    response.pageItems.length > limit ||
    typeof response.totalFilteredRecords !== 'number' ||
    !Number.isSafeInteger(response.totalFilteredRecords) ||
    response.totalFilteredRecords < 0 ||
    response.pageItems.length > response.totalFilteredRecords
  )
    throw new Error('Invalid audit page');
  const events = response.pageItems.map(auditEvent);
  if (new Set(events.map((event: AuditEvent) => event.id)).size !== events.length)
    throw new Error('Duplicate audit identity');
  return { events, total: response.totalFilteredRecords };
}
export function auditDay(event: AuditEvent): string {
  return event.timestamp === null ? '' : moment(event.timestamp).format('YYYY-MM-DD');
}
export function auditTone(value: string): string {
  switch (value.toUpperCase()) {
    case 'CREATE':
    case 'PROCESSED':
      return 'success';
    case 'DELETE':
    case 'FAILED':
    case 'REJECTED':
      return 'error';
    case 'UPDATE':
      return 'primary';
    default:
      return 'neutral';
  }
}
export function checkerState(event: AuditEvent): string {
  if (event.checker) return 'reviewed';
  if (/^(pending|awaiting[ .]approval|awaiting review)$/i.test(event.processingResult)) return 'pending';
  if (/^(failed|rejected)$/i.test(event.processingResult)) return 'failed';
  // A null checker never establishes that maker-checker was disabled.
  return 'missingChecker';
}

// Unknown command keys are redacted too: a denylist alone cannot protect arbitrary entity commands.
const SAFE_KEYS = new Set([
  'name',
  'externalId',
  'openingDate',
  'parentId',
  'locale',
  'dateFormat',
  'description',
  'active',
  'officeId',
  'productId',
  'amount',
  'principal',
  'currencyCode',
  'transactionDate',
  'submittedOnDate',
  'numberOfRepayments',
  'repaymentEvery',
  'interestRatePerPeriod'
]);
export interface SafeCommand {
  fields: { key: string; value: string }[];
  json: string;
  valid: boolean;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

class NumberLexeme {
  constructor(readonly value: string) {}
}
type SafeValue = string | boolean | null | NumberLexeme | SafeValue[] | { [key: string]: SafeValue };

export function safeCommand(command: unknown): SafeCommand {
  const invalid: SafeCommand = { fields: [], json: '', valid: false };
  if (typeof command !== 'string' || command.length > 65536) return invalid;
  try {
    const original: unknown = JSON.parse(command);
    if (!isRecord(original)) return invalid;
    // Check decoded strings too, so Unicode escapes cannot impersonate numeric tokens.
    let prefix = '__audit_number_';
    const decoded = JSON.stringify(original);
    while (decoded.includes(prefix)) prefix += '_';
    const numbers = new Map<string, NumberLexeme>();
    const protectedJson = command.replace(/"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g, (token) => {
      if (token.startsWith('"')) return token;
      const key = prefix + numbers.size;
      numbers.set(key, new NumberLexeme(token));
      return JSON.stringify(key);
    });
    const parsed: unknown = JSON.parse(protectedJson, (_key, value: unknown) =>
      typeof value === 'string' && numbers.has(value) ? numbers.get(value) : value
    );
    if (!isRecord(parsed)) return invalid;
    const clean = (value: unknown, depth: number): SafeValue => {
      if (depth > 8) return '[Redacted]';
      // Encoded objects can conceal credentials inside otherwise permitted string fields.
      if (typeof value === 'string' && /^\s*[\[{]/.test(value)) return '[Redacted]';
      if (value instanceof NumberLexeme) return value;
      if (Array.isArray(value)) {
        const items = value.slice(0, 100).map((item: unknown) => clean(item, depth + 1));
        return value.length > 100 ? [
              ...items,
              '[Truncated]'
            ] : items;
      }
      if (isRecord(value))
        return Object.fromEntries(
          Object.entries(value).map(
            ([
              key,
              item
            ]) => [
              key,
              SAFE_KEYS.has(key) ? clean(item, depth + 1) : '[Redacted]'
            ]
          )
        );
      return typeof value === 'string' || typeof value === 'boolean' ? value : value === null ? null : '[Redacted]';
    };
    // Only NumberLexeme instances may emit numeric text; strings are always JSON encoded.
    const serialize = (value: SafeValue, depth = 0): string => {
      if (value instanceof NumberLexeme) return value.value;
      if (Array.isArray(value)) return '[' + value.map((item) => serialize(item, depth + 1)).join(', ') + ']';
      if (value !== null && typeof value === 'object') {
        const indent = '  '.repeat(depth + 1);
        return (
          '{\n' +
          Object.entries(value)
            .map(
              ([
                key,
                item
              ]) => indent + JSON.stringify(key) + ': ' + serialize(item, depth + 1)
            )
            .join(',\n') +
          '\n' +
          '  '.repeat(depth) +
          '}'
        );
      }
      return JSON.stringify(value);
    };
    const redacted = clean(parsed, 0) as { [key: string]: SafeValue };
    return {
      fields: Object.keys(parsed)
        .filter((key) => SAFE_KEYS.has(key))
        .map((key) => ({ key, value: serialize(redacted[key]) })),
      json: serialize(redacted),
      valid: true
    };
  } catch {
    return invalid;
  }
}
export const CSV_FIELDS: (keyof AuditEvent)[] = [
  'id',
  'actionName',
  'entityName',
  'resourceId',
  'officeName',
  'maker',
  'timestamp',
  'checker',
  'checkedTimestamp',
  'processingResult'
];
export function auditCsv(events: AuditEvent[], headers: string[]): string {
  const cell = (value: string) =>
    '"' + (/^\s+[=+\-@|%]/.test(value) ? "'" + value : sanitizeCsvValue(value)).replace(/"/g, '""') + '"';
  return (
    '\uFEFF' +
    [
      headers,
      ...events.map((event) =>
        CSV_FIELDS.map((field) => {
          const value = event[field];
          return field === 'timestamp' || field === 'checkedTimestamp'
            ? value === null
              ? ''
              : moment(value as number).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            : String(value ?? '');
        })
      )
    ]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
  );
}

export const AUDIT_TRANSLATION_KEYS = [
  extract('auditRedesign.title'),
  extract('auditRedesign.description'),
  extract('auditRedesign.savedFilters'),
  extract('auditRedesign.export'),
  extract('auditRedesign.officeToday'),
  extract('auditRedesign.myEvents'),
  extract('auditRedesign.searchMode'),
  extract('auditRedesign.trailId'),
  extract('auditRedesign.resourceId'),
  extract('auditRedesign.user'),
  extract('auditRedesign.search'),
  extract('auditRedesign.madeRange'),
  extract('auditRedesign.entity'),
  extract('auditRedesign.action'),
  extract('auditRedesign.all'),
  extract('auditRedesign.status'),
  extract('auditRedesign.madeBy'),
  extract('auditRedesign.checker'),
  extract('auditRedesign.apply'),
  extract('auditRedesign.clear'),
  extract('auditRedesign.timezone'),
  extract('auditRedesign.madeFrom'),
  extract('auditRedesign.madeTo'),
  extract('auditRedesign.checkedFrom'),
  extract('auditRedesign.checkedTo'),
  extract('auditRedesign.invalid'),
  extract('auditRedesign.managePresets'),
  extract('auditRedesign.presetScope'),
  extract('auditRedesign.presetName'),
  extract('auditRedesign.save'),
  extract('auditRedesign.deletePreset'),
  extract('auditRedesign.cancel'),
  extract('auditRedesign.exportProgress'),
  extract('auditRedesign.backToEvent'),
  extract('auditRedesign.historyScope'),
  extract('auditRedesign.matching'),
  extract('auditRedesign.historyEvents'),
  extract('auditRedesign.serverPage'),
  extract('auditRedesign.loading'),
  extract('auditRedesign.loadError'),
  extract('auditRedesign.retry'),
  extract('auditRedesign.resource'),
  extract('auditRedesign.resourceNumber'),
  extract('auditRedesign.empty'),
  extract('auditRedesign.noHistoryPage'),
  extract('auditRedesign.pagination'),
  extract('auditRedesign.eventDetails'),
  extract('auditRedesign.close'),
  extract('auditRedesign.detailError'),
  extract('auditRedesign.notRecorded'),
  extract('auditRedesign.reviewed'),
  extract('auditRedesign.pending'),
  extract('auditRedesign.failed'),
  extract('auditRedesign.missingChecker'),
  extract('auditRedesign.checkerNotice'),
  extract('auditRedesign.submittedChanges'),
  extract('auditRedesign.previousUnavailable'),
  extract('auditRedesign.noSafeFields'),
  extract('auditRedesign.viewJson'),
  extract('auditRedesign.invalidJson'),
  extract('auditRedesign.requestDetails'),
  extract('auditRedesign.clientIp'),
  extract('auditRedesign.office'),
  extract('auditRedesign.copy'),
  extract('auditRedesign.history'),
  extract('auditRedesign.standalone'),
  extract('auditRedesign.permission'),
  extract('auditRedesign.copied'),
  extract('auditRedesign.copyFailed'),
  extract('auditRedesign.exportDone'),
  extract('auditRedesign.exportFailed'),
  extract('auditRedesign.madeOn'),
  extract('auditRedesign.checkedOn'),
  extract('auditRedesign.openOffice'),
  extract('labels.auditTrail.fields.name'),
  extract('labels.auditTrail.fields.externalId'),
  extract('labels.auditTrail.fields.openingDate'),
  extract('labels.auditTrail.fields.parentId'),
  extract('labels.auditTrail.fields.locale'),
  extract('labels.auditTrail.fields.dateFormat'),
  extract('labels.auditTrail.fields.description'),
  extract('labels.auditTrail.fields.active'),
  extract('labels.auditTrail.fields.officeId'),
  extract('labels.auditTrail.fields.productId'),
  extract('labels.auditTrail.fields.amount'),
  extract('labels.auditTrail.fields.principal'),
  extract('labels.auditTrail.fields.currencyCode'),
  extract('labels.auditTrail.fields.transactionDate'),
  extract('labels.auditTrail.fields.submittedOnDate'),
  extract('labels.auditTrail.fields.numberOfRepayments'),
  extract('labels.auditTrail.fields.repaymentEvery'),
  extract('labels.auditTrail.fields.interestRatePerPeriod'),
  extract('labels.auditTrail.statuses.Processed'),
  extract('labels.auditTrail.statuses.Pending'),
  extract('labels.auditTrail.statuses.Rejected'),
  extract('labels.auditTrail.statuses.Failed')
];
