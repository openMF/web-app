/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { presentAudit, isPendingAudit, canReviewRequest } from './checker-inbox-audit';
import enUs from 'assets/translations/en-US.json';

describe('Safe requested audit presentation', () => {
  it.each([
    undefined,
    null,
    ''
  ])('handles empty payload %s', (command) => {
    expect(presentAudit(command)).toEqual({ malformed: false, json: '', fields: [] });
  });
  it.each([
    '{',
    '{"password":"secret"',
    'undefined',
    '{123: 1}',
    'x'.repeat(1000001)
  ])('hides malformed or oversized payloads without returning the raw text', (command) => {
    expect(presentAudit(command)).toEqual({ malformed: true, json: '', fields: [] });
  });
  it('redacts secret fields throughout objects, arrays and encoded JSON without mutating the input', () => {
    const command = JSON.stringify({
      password: 'secret-1',
      repeatPassword: 'secret-2',
      nested: { 'access-token': 'secret-3', private_key: 'secret-4' },
      items: [{ base64EncodedAuthenticationKey: 'secret-5', value: 1 }],
      body: JSON.stringify({ apiKey: 'secret-6' }),
      auth: 'secret-7',
      accessKey: 'secret-8'
    });
    const presentation = presentAudit(command);
    expect(presentation.json).not.toContain('secret-');
    expect(presentation.json).toContain('[REDACTED]');
    expect(command).toContain('secret-1');
    expect(presentation.json).not.toContain('[object Object]');
  });
  it('preserves nested values, dates, decimals and unsafe integer precision as exact text', () => {
    const presentation = presentAudit(
      '{"amount":90000.000000000001,"externalId":9007199254740993,"date":"18 November 2026","array":[false,null,12],"zero":0}'
    );
    expect(presentation.json).toContain('90000.000000000001');
    expect(presentation.json).toContain('9007199254740993');
    expect(presentation.json).toContain('18 November 2026');
    expect(presentation.fields.find((field) => field.key === 'zero').value).toBe('0');
    expect(presentation.fields.find((field) => field.key === 'array').value).toContain('false');
  });

  it('keeps original numeric lexemes unquoted while preserving strings and redacting embedded JSON', () => {
    const command = String.raw`{"amount":90000.000000000001,"text":"90000.000000000001","array":[-0,1e+999],"body":"{\"amount\":9007199254740993,\"password\":\"hidden\"}","broken":"{123: 1}"}`;
    const { json } = presentAudit(command);
    expect(json).toContain('"amount": 90000.000000000001');
    expect(json).toContain('"text": "90000.000000000001"');
    expect(json).toContain('-0,');
    expect(json).toContain('1e+999');
    const parsed = JSON.parse(json);
    expect(typeof parsed.body).toBe('string');
    expect(parsed.body).toContain('"amount": 9007199254740993');
    expect(parsed.body).not.toContain('hidden');
    expect(parsed.broken).toBe('[REDACTED]');
  });

  it('ignores inherited label keys and preserves declared translations', () => {
    const { fields } = presentAudit('{"constructor":1,"toString":2,"__proto__":3,"mobileNo":"55"}');
    expect(fields.map((field) => field.label)).toEqual([
      '',
      '',
      '',
      'labels.inputs.Mobile Number'
    ]);
  });
  it('never treats payload keys that resemble history as a verified before snapshot', () => {
    const presentation = presentAudit('{"oldValue":"unverified","newValue":"submitted","emailAddress":null}');
    expect(presentation.fields).toHaveLength(3);
    expect(presentation.fields.find((field) => field.key === 'emailAddress').value).toBeNull();
    expect(presentation).not.toHaveProperty('previous');
  });
  it('handles primitive, array and escaped HTML payloads as text', () => {
    expect(presentAudit('[1,2]').fields[0].value).toContain('1');
    expect(presentAudit('false').fields[0].value).toBe('false');
    expect(presentAudit('{"mobileNo":"<img src=x onerror=alert(1)>"}').fields[0].value).toContain('<img');
  });
  it('uses labels that exist in the English translation inventory', () => {
    const presentation = presentAudit(
      '{"mobileNo":"1","emailAddress":"a","firstname":"b","lastname":"c","officeId":1,"activationDate":"a","submittedOnDate":"b","externalId":"c","accountNo":"1","principal":2,"dateFormat":"d","locale":"e"}'
    );
    for (const field of presentation.fields) {
      let value: any = enUs;
      for (const key of field.label.split('.')) value = value?.[key];
      expect(typeof value).toBe('string');
    }
  });
  it('blocks malformed maker identities without throwing', () => {
    const credentials = { username: 'reviewer', permissions: ['ALL_FUNCTIONS'] } as any;
    for (const maker of [
      undefined,
      null,
      7,
      {},
      [],
      ''
    ]) {
      expect(canReviewRequest({ id: 1, maker, actionName: 'UPDATE', entityName: 'CLIENT' } as any, credentials)).toBe(
        false
      );
    }
  });
  it('recognizes only verified pending status encodings', () => {
    for (const processingResult of [
      'Awaiting Approval',
      'commandProcessingResultType.awaiting.approval'
    ]) expect(isPendingAudit({ id: 1, maker: 'm', actionName: 'CREATE', entityName: 'CLIENT', processingResult })).toBe(
        true
      );
    expect(isPendingAudit({ id: 1, actionName: 'CREATE', entityName: 'CLIENT', processingResult: 'Processed' })).toBe(
      false
    );
    expect(canReviewRequest({ id: 1, maker: 'm', actionName: 'CREATE', entityName: 'CLIENT' }, null)).toBe(false);
  });
});
