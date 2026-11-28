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
import { AuditEvent, SafeCommand, auditEvent, safeCommand } from '../audit-presentation';

export interface AuditDetail {
  event: AuditEvent;
  command: SafeCommand;
}
export interface SubmittedDifference {
  key: string;
  previous?: string;
  current?: string;
  kind: 'added' | 'omitted' | 'changed' | 'unchanged';
}
export const REQUEST_FORMAT = new Set([
  'locale',
  'dateFormat'
]);

export function auditDetail(value: unknown, expectedId: string): AuditDetail {
  const event = auditEvent(value);
  if (event.id !== expectedId) throw new Error('Mismatched audit');
  const row = value as Record<string, unknown>;
  return { event, command: safeCommand(row.commandAsJson) };
}
export function sameResource(a: AuditEvent, b: AuditEvent): boolean {
  return !!a.resourceId && !!a.entityName && a.resourceId === b.resourceId && a.entityName === b.entityName;
}
/** Normalize decimal numbers without IEEE-754 rounding, while keeping JSON strings distinct. */
function comparable(value: string): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(value);
  if (!match) return value;
  let digits = (match[2] + (match[3] ?? '')).replace(/^0+/, '');
  if (!digits) return 'number:0';
  const trailing = /0*$/.exec(digits)[0].length;
  digits = digits.slice(0, digits.length - trailing);
  const exponent = BigInt(match[4] ?? '0') - BigInt((match[3] ?? '').length) + BigInt(trailing);
  return 'number:' + match[1] + digits + 'e' + exponent;
}

export function jsonTokens(json: string): { text: string; kind: string }[] {
  const pattern = /"(?:[^"\\]|\\.)*"\s*:|"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;
  const tokens: { text: string; kind: string }[] = [];
  let end = 0;
  for (const match of json.matchAll(pattern)) {
    tokens.push({ text: json.slice(end, match.index), kind: 'punctuation' });
    const text = match[0];
    tokens.push({ text, kind: text.endsWith(':') ? 'key' : text.startsWith('"') ? 'string' : 'literal' });
    end = match.index + text.length;
  }
  tokens.push({ text: json.slice(end), kind: 'punctuation' });
  return tokens;
}

export function compareSubmissions(previous: AuditDetail, current: AuditDetail): SubmittedDifference[] {
  if (
    !sameResource(previous.event, current.event) ||
    previous.event.id === current.event.id ||
    previous.event.timestamp === null ||
    current.event.timestamp === null ||
    previous.event.timestamp >= current.event.timestamp ||
    !previous.command.valid ||
    !current.command.valid
  )
    throw new Error('Comparison unavailable');
  const fields = (detail: AuditDetail) =>
    new Map(
      detail.command.fields
        .filter((field) => !REQUEST_FORMAT.has(field.key))
        .map((field) => [
          field.key,
          field.value
        ])
    );
  const before = fields(previous),
    after = fields(current);
  return [
    ...new Set([
      ...before.keys(),
      ...after.keys()
    ])
  ].map((key) => ({
    key,
    previous: before.get(key),
    current: after.get(key),
    kind: !before.has(key)
      ? 'added'
      : !after.has(key)
        ? 'omitted'
        : comparable(before.get(key)) === comparable(after.get(key))
          ? 'unchanged'
          : 'changed'
  }));
}
export function orderedHistory(events: AuditEvent[]): AuditEvent[] {
  return [
    ...new Map(
      events.map((event) => [
        event.id,
        event
      ])
    ).values()
  ].sort(
    (a, b) =>
      (b.timestamp ?? -Infinity) - (a.timestamp ?? -Infinity) || b.id.length - a.id.length || b.id.localeCompare(a.id)
  );
}
export function creationInterval(current: AuditEvent, history: AuditEvent[]): number | null {
  if (
    current.actionName !== 'UPDATE' ||
    current.processingResult.toLowerCase() !== 'processed' ||
    current.timestamp === null
  )
    return null;
  const creation = history.filter(
    (event) =>
      sameResource(current, event) &&
      event.actionName === 'CREATE' &&
      event.processingResult.toLowerCase() === 'processed' &&
      event.timestamp !== null &&
      event.timestamp < current.timestamp
  );
  // Multiple creation submissions are ambiguous; do not pick one arbitrarily.
  if (creation.length !== 1) return null;
  const minutes = (current.timestamp - creation[0].timestamp) / 60000;
  return minutes <= 60 ? Math.round(minutes) : null;
}

/** Export is an explicitly projected safe API representation, never the original HTTP body. */
export function safeAuditJson(detail: AuditDetail): string {
  return JSON.stringify(
    {
      representation: 'Safe API-returned audit representation',
      audit: detail.event,
      commandAsJson: detail.command.valid ? detail.command.json : null,
      commandStatus: detail.command.valid ? 'redacted' : 'unavailable'
    },
    null,
    2
  );
}

// Register dynamic state, feedback and difference labels with the translation extractor.
export const AUDIT_DETAIL_TRANSLATIONS = [
  extract('auditDetails.title'),
  extract('auditDetails.trail'),
  extract('auditDetails.activity'),
  extract('auditDetails.navigation'),
  extract('auditDetails.previousTrail'),
  extract('auditDetails.nextTrail'),
  extract('auditDetails.copy'),
  extract('auditDetails.export'),
  extract('auditDetails.back'),
  extract('auditDetails.metadata'),
  extract('auditDetails.madeBy'),
  extract('auditDetails.maker'),
  extract('auditDetails.dateTime'),
  extract('auditDetails.resource'),
  extract('auditDetails.openOffice'),
  extract('auditDetails.checker'),
  extract('auditDetails.noneRecorded'),
  extract('auditDetails.pending'),
  extract('auditDetails.clientIp'),
  extract('auditDetails.notRecorded'),
  extract('auditDetails.metadataGap'),
  extract('auditDetails.submitted'),
  extract('auditDetails.fieldCount'),
  extract('auditDetails.submittedDescription'),
  extract('auditDetails.invalidJson'),
  extract('auditDetails.noFields'),
  extract('auditDetails.field'),
  extract('auditDetails.value'),
  extract('auditDetails.parameter'),
  extract('auditDetails.currentParentName'),
  extract('auditDetails.redaction'),
  extract('auditDetails.requestFormat'),
  extract('auditDetails.jsonDescription'),
  extract('auditDetails.viewJson'),
  extract('auditDetails.copyJson'),
  extract('auditDetails.safeJson'),
  extract('auditDetails.comparison'),
  extract('auditDetails.comparisonDescription'),
  extract('auditDetails.comparisonUnavailable'),
  extract('auditDetails.previousValue'),
  extract('auditDetails.currentValue'),
  extract('auditDetails.difference'),
  extract('auditDetails.added'),
  extract('auditDetails.omitted'),
  extract('auditDetails.changed'),
  extract('auditDetails.unchanged'),
  extract('auditDetails.notSupplied'),
  extract('auditDetails.nullValue'),
  extract('auditDetails.historyOf'),
  extract('auditDetails.loaded'),
  extract('auditDetails.historyScope'),
  extract('auditDetails.loadingHistory'),
  extract('auditDetails.thisTrail'),
  extract('auditDetails.noHistory'),
  extract('auditDetails.historyError'),
  extract('auditDetails.retry'),
  extract('auditDetails.loadMore'),
  extract('auditDetails.historyLimit'),
  extract('auditDetails.compareWith'),
  extract('auditDetails.observations'),
  extract('auditDetails.observationsDescription'),
  extract('auditDetails.noChecker'),
  extract('auditDetails.checkerLimitation'),
  extract('auditDetails.noIp'),
  extract('auditDetails.ipLimitation'),
  extract('auditDetails.creationInterval'),
  extract('auditDetails.creationEvidence'),
  extract('auditDetails.noObservations'),
  extract('auditDetails.unknownResource'),
  extract('auditDetails.invalid'),
  extract('auditDetails.error'),
  extract('auditDetails.forbidden'),
  extract('auditDetails.loading'),
  extract('auditDetails.copied'),
  extract('auditDetails.copyFailed'),
  extract('auditDetails.exported'),
  extract('auditDetails.exportFailed')
];
