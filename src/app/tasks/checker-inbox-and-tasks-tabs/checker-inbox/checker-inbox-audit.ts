/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';
import { Credentials } from 'app/core/authentication/credentials.model';

export interface MakerCheckerRecord {
  id: number;
  actionName: string;
  entityName: string;
  resourceId?: number;
  clientId?: number;
  clientName?: string;
  loanId?: number;
  loanAccountNo?: string;
  savingsAccountNo?: string;
  madeOnDate?: number | string;
  processingResult?: string;
  maker?: string;
  commandAsJson?: string;
}

export function checkerPermission(row: MakerCheckerRecord): string {
  return `${row.actionName}_${row.entityName}_CHECKER`.toUpperCase();
}

export function isOwnRequest(row: MakerCheckerRecord, credentials: Credentials | null): boolean {
  // AuditData.maker is the login username, never the staff/display name.
  // Treat case variants conservatively; backend user IDs remain the final authority.
  return (
    typeof row?.maker === 'string' &&
    typeof credentials?.username === 'string' &&
    !!row.maker &&
    !!credentials.username &&
    row.maker.toLowerCase() === credentials.username.toLowerCase()
  );
}

export function canReviewRequest(row: MakerCheckerRecord, credentials: Credentials | null): boolean {
  if (
    !Number.isSafeInteger(row?.id) ||
    row.id <= 0 ||
    typeof row?.maker !== 'string' ||
    !row.maker.trim() ||
    typeof credentials?.username !== 'string' ||
    !credentials.username ||
    isOwnRequest(row, credentials)
  )
    return false;
  const permissions = credentials.permissions || [];
  return (
    typeof row.actionName === 'string' &&
    !!row.actionName &&
    typeof row.entityName === 'string' &&
    !!row.entityName &&
    Array.isArray(permissions) &&
    permissions.some((permission) => [
        'ALL_FUNCTIONS',
        'CHECKER_SUPER_USER',
        checkerPermission(row)
      ].includes(permission))
  );
}

export function isPendingAudit(row: MakerCheckerRecord): boolean {
  return [
    'awaitingapproval',
    'commandprocessingresulttypeawaitingapproval'
  ].includes(
    String(row.processingResult || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '')
  );
}

const sensitiveField =
  /password|passwd|pwd|token|secret|credential|authorization|authentication|privatekey|apikey|accesskey|signingkey|^auth$|securityanswer|pin(number|code)?$|cardnumber|cvv|cvc/;

class ExactNumber {
  constructor(readonly digits: string) {}
}

const numberMarker = '\u0000audit-number:';

function parseExact(json: string): unknown {
  // Validate first so rewriting tokens cannot make invalid JSON valid.
  JSON.parse(json);
  const encoded = json.replace(
    /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (token, quoted: string, colon: string, digits: string) => {
      if (digits !== undefined) return JSON.stringify(numberMarker + 'n' + digits);
      if (colon) return token;
      const value: string = JSON.parse(quoted);
      return value.startsWith(numberMarker) ? JSON.stringify(numberMarker + 's' + value) : token;
    }
  );
  return JSON.parse(encoded, (_key, value: unknown) => {
    if (typeof value !== 'string' || !value.startsWith(numberMarker)) return value;
    const payload = value.slice(numberMarker.length);
    return payload.startsWith('n') ? new ExactNumber(payload.slice(1)) : payload.slice(1);
  });
}

function formatExact(value: unknown, depth = 0): string {
  if (value instanceof ExactNumber) return value.digits;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  const array = Array.isArray(value);
  const open = array ? '[' : '{';
  const close = array ? ']' : '}';
  const entries = array
    ? value.map((item) => formatExact(item, depth + 1))
    : Object.entries(value).map(
        ([
          key,
          item
        ]) => JSON.stringify(key) + ': ' + formatExact(item, depth + 1)
      );
  if (!entries.length) return open + close;
  const indent = '  '.repeat(depth);
  return open + '\n' + entries.map((entry) => indent + '  ' + entry).join(',\n') + '\n' + indent + close;
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 32) return '[REDACTED]';
  if (value instanceof ExactNumber) return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(
        ([
          key,
          item
        ]) => [
          key,
          sensitiveField.test(key.toLowerCase().replace(/[^a-z0-9]/g, '')) ? '[REDACTED]' : redact(item, depth + 1)
        ]
      )
    );
  }
  // Some commands embed JSON as a string (for example a batch body).
  if (typeof value === 'string' && /^[\s]*[\[{]/.test(value)) {
    try {
      return formatExact(redact(parseExact(value), depth + 1));
    } catch {
      return '[REDACTED]';
    }
  }
  return value;
}

export interface AuditPresentation {
  malformed: boolean;
  json: string;
  fields: { key: string; label: string; value: string | null }[];
}

const fieldLabels: Record<string, string> = {
  mobileNo: extract('labels.inputs.Mobile Number'),
  emailAddress: extract('labels.inputs.Email'),
  firstname: extract('labels.inputs.First Name'),
  lastname: extract('labels.inputs.Last Name'),
  officeId: extract('labels.inputs.Office'),
  activationDate: extract('labels.inputs.Activation Date'),
  submittedOnDate: extract('labels.inputs.Submitted On'),
  externalId: extract('labels.inputs.External Id'),
  accountNo: extract('labels.inputs.Account Number'),
  principal: extract('labels.inputs.Principal'),
  dateFormat: extract('checkerInbox.review.dateFormat'),
  locale: extract('checkerInbox.review.locale')
};

/** Only submitted values are authoritative. There is no historical before snapshot
 * in AuditData; even payload keys called oldValue are simply requested data. */
export function presentAudit(command: unknown): AuditPresentation {
  if (command === null || command === undefined || command === '') return { malformed: false, json: '', fields: [] };
  try {
    if (typeof command !== 'string' || command.length > 1000000) throw new Error();
    const parsed = redact(parseExact(command));
    const entries: [
      string,
      unknown
    ][] =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !(parsed instanceof ExactNumber)
        ? Object.entries(parsed)
        : [[
              'value',
              parsed
            ]];
    return {
      malformed: false,
      json: formatExact(parsed),
      fields: entries.map(
        ([
          key,
          value
        ]) => ({
          key,
          label: Object.hasOwn(fieldLabels, key) ? fieldLabels[key] : '',
          value: value === null || value === '' ? null : typeof value === 'string' ? value : formatExact(value)
        })
      )
    };
  } catch {
    // Never display malformed raw text: it may contain credentials that cannot be redacted safely.
    return { malformed: true, json: '', fields: [] };
  }
}
