/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  auditEvent,
  auditPage,
  auditDay,
  auditTone,
  checkerState,
  safeCommand,
  auditCsv,
  canReadAudit,
  validAuditRange
} from './audit-presentation';
const row = (extra = {}) => ({
  id: 12,
  entityName: 'OFFICE',
  resourceId: 3,
  actionName: 'UPDATE',
  maker: 'fixture',
  processingResult: 'Processed',
  madeOnDate: [
    2026,
    11,
    12,
    13,
    20
  ],
  ...extra
});
describe('audit presentation integrity', () => {
  it('projects metadata without command payloads', () => {
    expect(auditEvent(row({ commandAsJson: 'SECRET' }))).not.toHaveProperty('commandAsJson');
  });
  it('rejects rounded or mismatched IDs', () => {
    expect(() => auditEvent(row({ id: Number.MAX_SAFE_INTEGER + 1 }))).toThrow();
  });
  it('validates authoritative server pagination', () => {
    expect(auditPage({ pageItems: [row()], totalFilteredRecords: 50 }, 25).total).toBe(50);
    expect(() => auditPage({ pageItems: [row()], totalFilteredRecords: -1 }, 25)).toThrow();
    expect(() =>
      auditPage(
        { pageItems: [
            row(),
            row()
          ], totalFilteredRecords: 2 },
        25
      )
    ).toThrow();
  });
  it('groups reporting wall-clock dates and explicit offsets consistently', () => {
    expect(auditDay(auditEvent(row()))).toBe('2026-11-12');
    expect(auditDay(auditEvent(row({ madeOnDate: '2026-11-12T23:30:00-05:00' })))).toBe(
      auditDay(auditEvent(row({ madeOnDate: '2026-11-13T04:30:00Z' })))
    );
    expect(auditDay(auditEvent(row({ madeOnDate: null })))).toBe('');
  });
  it.each([
    '',
    'Processed',
    'Unknown',
    'awaitingXapproval'
  ])('never infers direct processing from a null checker: %s', (processingResult) => {
    expect(checkerState(auditEvent(row({ processingResult })))).toBe('missingChecker');
  });
  it.each([
    [
      'Pending',
      'pending'
    ],
    [
      'awaiting.approval',
      'pending'
    ],
    [
      'Awaiting.Approval',
      'pending'
    ],
    [
      'awaiting approval',
      'pending'
    ],
    [
      'awaiting review',
      'pending'
    ],
    [
      'Failed',
      'failed'
    ],
    [
      'Rejected',
      'failed'
    ]
  ])('maps %s honestly', (processingResult, state) => {
    expect(checkerState(auditEvent(row({ processingResult })))).toBe(state);
  });
  it('uses actual checker metadata', () => {
    expect(checkerState(auditEvent(row({ checker: 'reviewer' })))).toBe('reviewed');
  });
  it('does not invent an IP or processing success', () => {
    expect(auditEvent(row({ clientIp: 'NOT_THE_DTO_FIELD', processingResult: '' })).ip).toBe('');
    expect(auditTone('')).toBe('neutral');
    expect(auditTone('CREATE')).toBe('success');
  });
  it('requires audit-read permission even with menu RBAC disabled', () => {
    expect(canReadAudit({ authenticated: true, permissions: ['READ_CLIENT'] })).toBe(false);
    for (const permission of [
      'READ_AUDIT',
      'ALL_FUNCTIONS',
      'ALL_FUNCTIONS_READ'
    ]) {
      expect(canReadAudit({ authenticated: true, permissions: [permission] })).toBe(true);
    }
  });
  it.each([
    '{broken',
    '[]',
    'null',
    '42',
    '{"amount":NaN}',
    '{"amount":01}'
  ])('fails closed for invalid command %s', (command) => {
    expect(safeCommand(command).valid).toBe(false);
  });
  it('redacts secrets and unknown nested keys in submitted changes and JSON', () => {
    const result = safeCommand(
      JSON.stringify({ name: { password: 'SECRET', name: '<b>text</b>' }, amount: [
          1,
          { token: 'SECRET', amount: 2 }
        ], accessToken: 'SECRET', unknown: 'SECRET' })
    );
    expect(result.json).not.toContain('SECRET');
    expect(result.json).toContain('[Redacted]');
    expect(result.fields.map((field) => field.key)).toEqual([
      'name',
      'amount'
    ]);
    expect(result.json).toContain('<b>text</b>');
    expect(result.fields[0]).not.toHaveProperty('previousValue');
  });
  it('preserves number lexemes, nulls, arrays, booleans and empty strings', () => {
    const result = safeCommand(
      '{"amount":9007199254740993123.00001,"principal":1e-23,"active":false,"name":"","externalId":null,"openingDate":[2026,1,2]}'
    );
    expect(result.json).toContain('9007199254740993123.00001');
    expect(result.json).toContain('1e-23');
    expect(result.fields.find((field) => field.key === 'externalId').value).toBe('null');
    expect(result.fields.find((field) => field.key === 'name').value).toBe('""');
  });
  it('does not confuse numeric strings or escaped quotes with numbers', () => {
    expect(safeCommand('{"externalId":"00123","name":"x\\\" 123"}').json).toContain('00123');
    expect(safeCommand('{"name":"__audit_number_0","amount":2}').fields[0].value).toBe('"__audit_number_0"');
  });
  it('bounds command size and nesting', () => {
    expect(safeCommand(' '.repeat(65537)).valid).toBe(false);
  });
  it('validates partial dates, inverted ranges and invalid times without requests', () => {
    expect(validAuditRange('2026-11-12T10:00', '2026-11-12T11:00')).toBe(true);
    expect(validAuditRange('2026-11-12T12:00', '2026-11-12T11:00')).toBe(false);
    expect(validAuditRange('2026-11-12T25:00', '')).toBe(false);
    expect(validAuditRange('2026-02-30T10:00', '')).toBe(false);
  });
  it('quotes real CSV values and prevents formula injection including leading whitespace', () => {
    const csv = auditCsv([auditEvent(row({ maker: '  =HYPERLINK("x")', officeName: 'one,two\nthree' }))], ['ID']);
    expect(csv).toContain('"\'  =HYPERLINK(""x"")"');
    expect(csv).toContain('"one,two\nthree"');
    expect(csv).not.toContain('commandAsJson');
  });
});
