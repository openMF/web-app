/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  auditId,
  auditTimestamp,
  canReadOfficeAudit,
  groupOfficeAudits,
  isDirectOfficeAudit,
  mergeOfficeAudits,
  normalizeOfficeAudit,
  officeAuditCsv,
  readOfficeAuditPage,
  submittedOfficeFields,
  validAuditRange
} from './office-audit';

const row = (overrides: any = {}) => ({
  id: 12,
  resourceId: 4,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  maker: 'recorded-user',
  madeOnDate: [
    2026,
    10,
    2,
    16,
    5,
    0
  ],
  processingResult: 'Processed',
  ...overrides
});

describe('Office audit trust boundary', () => {
  it.each([
    'READ_AUDIT',
    'ALL_FUNCTIONS_READ',
    'ALL_FUNCTIONS'
  ])('requires authentication and supports %s', (permission) => {
    expect(canReadOfficeAudit({ authenticated: true, permissions: [permission] })).toBe(true);
    expect(canReadOfficeAudit({ authenticated: false, permissions: [permission] })).toBe(false);
  });
  it('denies office-read-only and missing credentials', () => {
    expect(canReadOfficeAudit({ authenticated: true, permissions: ['READ_OFFICE'] })).toBe(false);
    expect(canReadOfficeAudit(null)).toBe(false);
  });
  it('requires exact OFFICE entity and resource, regardless of contextual officeName', () => {
    expect(normalizeOfficeAudit(row(), '4')?.resourceId).toBe('4');
    for (const event of [
      row({ resourceId: 5, officeName: 'Selected office' }),
      row({ entityName: 'OFFICETRANSACTION' }),
      row({ entityName: 'ADDRESS' }),
      row({ entityName: 'UNKNOWN' }),
      row({ resourceId: null }),
      row({ id: null })
    ]) {
      expect(normalizeOfficeAudit(event, '4')).toBeNull();
    }
  });
  it('narrows unknown audit values before accessing their metadata', () => {
    const invalidValues: unknown[] = [
      null,
      undefined,
      false,
      4,
      'office',
      [],
      () => row()
    ];
    for (const value of invalidValues) {
      expect(isDirectOfficeAudit(value, '4')).toBe(false);
      expect(normalizeOfficeAudit(value, '4')).toBeNull();
    }
    const untrusted: unknown = row({ maker: { username: 'unverified' }, actionName: 123, checkedOnDate: {} });
    const event = normalizeOfficeAudit(untrusted, '4');
    expect(event.maker).toBe('');
    expect(event.actionName).toBe('');
    expect(event.checkedTimestamp).toBeNull();
  });
  it('retains only allowlisted metadata and never infers an automated actor', () => {
    const event = normalizeOfficeAudit(
      row({ maker: null, isSystem: true, commandAsJson: '{"token":"secret"}', ip: 'private' }),
      '4'
    );
    expect(event.maker).toBe('');
    expect(event.initials).toBe('');
    expect(event).not.toHaveProperty('isSystem');
    expect(event).not.toHaveProperty('commandAsJson');
    expect(event).not.toHaveProperty('ip');
    expect(normalizeOfficeAudit(row({ maker: 'admin' }), '4').maker).toBe('admin');
  });
  it('preserves exact string identifiers and rejects already rounded numbers', () => {
    expect(auditId('90071992547409931234')).toBe('90071992547409931234');
    expect(auditId(9007199254740992)).toBeNull();
    expect(auditId('1/../../audits')).toBeNull();
  });
  it('validates paginated responses and discards entity prefix collisions', () => {
    const page = readOfficeAuditPage(
      { pageItems: [
          row(),
          row({ entityName: 'OFFICETRANSACTION' })
        ], totalFilteredRecords: 30 },
      '4'
    );
    expect(page.events).toHaveLength(1);
    expect(page.received).toBe(2);
    expect(page.total).toBe(30);
    for (const response of [
      null,
      [] as unknown[],
      { pageItems: [] as unknown[], totalFilteredRecords: '4' },
      { pageItems: [null], totalFilteredRecords: 1 },
      { pageItems: [] as unknown[], totalFilteredRecords: -1 }
    ]) {
      expect(() => readOfficeAuditPage(response, '4')).toThrow();
    }
  });
  it('validates the actual requested page limit, including a one-record remaining budget', () => {
    const response: unknown = { pageItems: [row()], totalFilteredRecords: 1000 };
    expect(readOfficeAuditPage(response, '4', 1).received).toBe(1);
    expect(() =>
      readOfficeAuditPage(
        { pageItems: [
            row(),
            row({ id: 13 })
          ], totalFilteredRecords: 1000 },
        '4',
        1
      )
    ).toThrow();
    for (const limit of [
      0,
      -1,
      1.5,
      26,
      NaN
    ]) {
      expect(() => readOfficeAuditPage(response, '4', limit)).toThrow();
    }
  });
});

describe('Recorded office values', () => {
  it('never fabricates before values from a submitted-only command', () => {
    const fields = submittedOfficeFields('{"name":"Submitted name","externalId":"000123"}');
    expect(fields).toEqual([
      { key: 'name', label: 'labels.inputs.Name', value: 'Submitted name' },
      { key: 'externalId', label: 'labels.inputs.External Id', value: '000123' }
    ]);
    expect(fields.some((field: any) => 'oldValue' in field || 'before' in field)).toBe(false);
  });
  it('distinguishes an explicit submitted null from an absent field without claiming a null prior value', () => {
    expect(submittedOfficeFields('{"name":null}')).toEqual([{ key: 'name', label: 'labels.inputs.Name', value: null }]);
    expect(submittedOfficeFields('{}')).toEqual([]);
  });
  it('does not trust hypothetical diff envelopes or enriched current entity names', () => {
    expect(submittedOfficeFields('{"changes":{"name":{"old":"A","new":"B"}},"parentOffice":"Current name"}')).toEqual(
      []
    );
  });
  it.each([
    'not json',
    'null',
    '[]',
    '"text"',
    '',
    '{'.repeat(32769)
  ])('rejects malformed or oversized JSON safely', (command) => {
    expect(submittedOfficeFields(command)).toBeNull();
  });
  it('redacts secrets, confidential unknown fields, arrays and complex objects', () => {
    const fields = submittedOfficeFields(
      JSON.stringify({
        password: 'secret',
        token: 'secret',
        pin: '1234',
        accountNumber: 'private',
        name: { password: 'nested-secret' },
        externalId: ['private'],
        openingDate: false,
        parentId: 3
      })
    );
    expect(fields.map((field) => field.key)).toEqual([
      'openingDate',
      'parentId'
    ]);
    expect(JSON.stringify(fields)).not.toContain('secret');
  });
  it('preserves text exactly, including leading zeroes and HTML-like values', () => {
    const fields = submittedOfficeFields(
      '{"name":"<img src=x onerror=alert(1)>","externalId":"00012345678901234567890"}'
    );
    expect(fields[0].value).toBe('<img src=x onerror=alert(1)>');
    expect(fields[1].value).toBe('00012345678901234567890');
  });
  it('omits unverified coordinate fields and unsafe numeric identifiers instead of rounding', () => {
    expect(
      submittedOfficeFields('{"latitude":19.38805389,"longitude":-99.25030442,"parentId":9007199254740993}')
    ).toEqual([]);
  });
});

describe('Office audit chronology and filters', () => {
  it('supports Fineract date arrays, epoch milliseconds and ISO timestamps, including pre-2001 dates', () => {
    expect(
      auditTimestamp([
        2026,
        10,
        2,
        16,
        5
      ])
    ).toBe(new Date(2026, 9, 2, 16, 5).getTime());
    expect(auditTimestamp(1700000000000)).toBe(1700000000000);
    expect(auditTimestamp(946684800000)).toBe(946684800000);
    expect(auditTimestamp('2026-10-01T00:00:00Z')).toBe(Date.parse('2026-10-01T00:00:00Z'));
    expect(auditTimestamp('bad')).toBeNull();
    expect(
      auditTimestamp([
        2026,
        13,
        1
      ])
    ).toBeNull();
  });
  it('sorts newest first, deduplicates IDs and merges months across pages', () => {
    const events = mergeOfficeAudits(
      [
        normalizeOfficeAudit(
          row({ id: 10, madeOnDate: [
              2026,
              9,
              1
            ] }),
          '4'
        )
      ],
      [
        normalizeOfficeAudit(row({ id: 12 }), '4'),
        normalizeOfficeAudit(row({ id: 11 }), '4'),
        normalizeOfficeAudit(
          row({ id: 10, madeOnDate: [
              2026,
              9,
              1
            ] }),
          '4'
        )
      ]
    );
    expect(events.map((event) => event.id)).toEqual([
      '12',
      '11',
      '10'
    ]);
    expect(
      groupOfficeAudits(events).map((group) => [
        group.key,
        group.events.length
      ])
    ).toEqual([
      [
        '2026-10',
        2
      ],
      [
        '2026-09',
        1
      ]
    ]);
  });
  it('does not substitute now for a missing timestamp or create empty month groups', () => {
    const groups = groupOfficeAudits([normalizeOfficeAudit(row({ madeOnDate: null }), '4')]);
    expect(groups[0].key).toBe('unknown');
    expect(groups[0].timestamp).toBeNull();
    expect(groupOfficeAudits([])).toEqual([]);
  });
  it('validates local datetime ranges without converting their day boundaries', () => {
    expect(validAuditRange('2026-10-01T00:00', '2026-10-31T23:59:59')).toBe(true);
    expect(validAuditRange('2026-10-02T00:00', '2026-10-01T23:59')).toBe(false);
    expect(validAuditRange('invalid', '')).toBe(false);
    expect(validAuditRange('', '')).toBe(true);
  });
});

describe('Loaded office audit CSV', () => {
  it('quotes commas, double quotes and line breaks; guards formula injection including whitespace', () => {
    const event = normalizeOfficeAudit(row({ maker: '=HYPERLINK("danger")', actionName: ' action,\n"test"' }), '4');
    const csv = officeAuditCsv([event], '4', ['ID']);
    expect(csv).toContain('"\'=HYPERLINK(""danger"")"');
    expect(csv).toContain('" action,\n""test"""');
    expect(officeAuditCsv([normalizeOfficeAudit(row({ maker: '  =1+1' }), '4')], '4', ['ID'])).toContain('"\'  =1+1"');
  });
  it('revalidates branch scope, excludes other entities, deduplicates and never exports payloads', () => {
    const event = normalizeOfficeAudit(
      row({ id: '90071992547409931234', commandAsJson: '{"password":"secret"}' }),
      '4'
    );
    const csv = officeAuditCsv(
      [
        event,
        event,
        { ...event, id: '13', resourceId: '5' },
        { ...event, id: '14', entityName: 'ADDRESS' } as any
      ],
      '4',
      ['ID']
    );
    expect(csv.match(/90071992547409931234/g)).toHaveLength(1);
    expect(csv).not.toContain('secret');
    expect(csv).not.toContain('ADDRESS');
    expect(csv).not.toContain('"13"');
    expect(csv).toContain('2026-10-02T16:05:00.000');
  });
});
