/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
  auditDetail,
  compareSubmissions,
  creationInterval,
  orderedHistory,
  safeAuditJson,
  sameResource
} from './audit-detail';
import { safeCommand, auditEvent } from '../audit-presentation';
const row = (extra: Record<string, unknown> = {}) => ({
  id: 12,
  resourceId: 3,
  entityName: 'OFFICE',
  actionName: 'UPDATE',
  madeOnDate: [
    2026,
    11,
    12,
    12,
    59,
    45
  ],
  processingResult: 'Processed',
  commandAsJson: '{"name":"New","externalId":null,"dateFormat":"dd MMMM yyyy","locale":"en"}',
  ...extra
});
const older = (extra: Record<string, unknown> = {}) =>
  auditDetail(
    row({ id: 11, madeOnDate: [
        2026,
        11,
        12,
        12,
        54,
        6
      ], commandAsJson: '{"name":"Old","parentId":1,"externalId":"3","locale":"es"}', ...extra }),
    '11'
  );

describe('audit investigation integrity', () => {
  it('validates detail identity', () => {
    expect(() => auditDetail(row(), '13')).toThrow();
  });
  it('compares submissions with precise presence semantics and excludes format metadata', () => {
    const diff = compareSubmissions(older(), auditDetail(row(), '12'));
    expect(diff).toEqual([
      { key: 'name', previous: '"Old"', current: '"New"', kind: 'changed' },
      { key: 'parentId', previous: '1', current: undefined, kind: 'omitted' },
      { key: 'externalId', previous: '"3"', current: 'null', kind: 'changed' }
    ]);
    expect(diff[1].kind).not.toBe('deleted');
  });
  it.each([
    { resourceId: 4 },
    { entityName: 'CLIENT' },
    { entityName: 'OFFICETRANSACTION' },
    { madeOnDate: null },
    { madeOnDate: [
        2026,
        11,
        12,
        13,
        0
      ] },
    { commandAsJson: 'INVALID' }
  ])('rejects invalid or unrelated comparison %j', (extra) => {
    expect(() => compareSubmissions(older(extra), auditDetail(row(), '12'))).toThrow();
  });
  it('distinguishes number and string, null and absent, added and unchanged fields', () => {
    const current = auditDetail(row({ commandAsJson: '{"name":"Old","parentId":"1","amount":null}' }), '12');
    const diff = compareSubmissions(older(), current);
    expect(diff.find((field) => field.key === 'parentId').kind).toBe('changed');
    expect(diff.find((field) => field.key === 'name').kind).toBe('unchanged');
    expect(diff.find((field) => field.key === 'amount')).toEqual({
      key: 'amount',
      previous: undefined,
      current: 'null',
      kind: 'added'
    });
  });
  it('sorts timestamps, deduplicates stable IDs and uses IDs only for ties', () => {
    const a = auditEvent(row()),
      b = older().event;
    expect(
      orderedHistory([
        a,
        b,
        a
      ]).map((event) => event.id)
    ).toEqual([
      '12',
      '11'
    ]);
  });
  it('never considers same numeric IDs on unrelated entities the same resource', () => {
    expect(sameResource(auditEvent(row()), auditEvent(row({ entityName: 'CLIENT' })))).toBe(false);
  });
  it('derives a rounded interval only from a processed same-resource creation', () => {
    const current = auditEvent(row());
    expect(creationInterval(current, [older({ actionName: 'CREATE' }).event])).toBe(6);
    for (const extra of [
      { actionName: 'CREATE', entityName: 'CLIENT' },
      { actionName: 'CREATE', processingResult: 'Failed' },
      { actionName: 'CREATE', madeOnDate: null as unknown }
    ]) {
      expect(creationInterval(current, [older(extra).event])).toBeNull();
    }
    expect(creationInterval(current, [])).toBeNull();
    expect(
      creationInterval(current, [
        older({ actionName: 'CREATE' }).event,
        { ...older({ actionName: 'CREATE' }).event, id: '10' }
      ])
    ).toBeNull();
  });
  it('does not expose a redacted number via Unicode-escaped placeholder collision', () => {
    const result = safeCommand('{"password":987654321,"name":"\\u005f_audit_number_0","amount":9007199254740993.001}');
    expect(result.json).not.toContain('987654321');
    expect(result.fields.find((field) => field.key === 'name').value).toBe('"__audit_number_0"');
    expect(result.json).toContain('9007199254740993.001');
  });
  it('normalizes equivalent numeric representations without merging strings with numbers', () => {
    const before = older({ commandAsJson: '{"amount":9007199254740993.0010,"principal":1.0,"externalId":"1"}' });
    const after = auditDetail(
      row({ commandAsJson: '{"amount":90071992547409930010e-4,"principal":1,"externalId":1}' }),
      '12'
    );
    expect(compareSubmissions(before, after).map((field) => field.kind)).toEqual([
      'unchanged',
      'unchanged',
      'changed'
    ]);
  });
  it('redacts encoded object strings that may conceal credentials', () => {
    const command = safeCommand(JSON.stringify({ name: '{"token":"HIDDEN_SECRET"}' }));
    expect(command.json).not.toContain('HIDDEN_SECRET');
    expect(command.json).toContain('[Redacted]');
  });
  it('does not describe pending or failed update submissions as edits', () => {
    for (const processingResult of [
      'awaiting.approval',
      'Failed'
    ]) {
      expect(
        creationInterval(auditEvent(row({ processingResult })), [older({ actionName: 'CREATE' }).event])
      ).toBeNull();
    }
  });
  it('exports only projected metadata and safe API command representation', () => {
    const detail = auditDetail(
      row({ accessToken: 'TOP_SECRET', commandAsJson: '{"token":"SECRET","name":"safe"}' }),
      '12'
    );
    const exported = safeAuditJson(detail);
    expect(exported).not.toContain('SECRET');
    expect(exported).toContain('Safe API-returned audit representation');
    expect(exported).not.toContain('original HTTP');
    expect(JSON.parse(exported).commandAsJson).toContain('[Redacted]');
  });
});
