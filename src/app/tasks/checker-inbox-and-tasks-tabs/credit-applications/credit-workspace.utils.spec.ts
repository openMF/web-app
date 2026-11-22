/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  compareCreditAmounts,
  creditCalendarDate,
  creditCsvCell,
  creditFilterError,
  creditStatusId
} from './credit-workspace.utils';
import fs from 'fs';
import path from 'path';

describe('Credit workspace financial presentation', () => {
  it('compares exact financial decimal strings beyond floating-point precision', () => {
    expect(compareCreditAmounts('9007199254740993.00000001', '9007199254740993.00000000')).toBe(1);
    expect(compareCreditAmounts('000100.1', '100.10000')).toBe(0);
    expect(compareCreditAmounts('0.00000001', '0.00000002')).toBe(-1);
    expect(
      creditFilterError({
        minAmount: '9007199254740993.00000001',
        maxAmount: '9007199254740993.00000000',
        currencyCode: 'USD'
      })
    ).toBe('labels.text.Minimum Amount cannot be greater than Maximum Amount');
  });
  it.each([
    'NaN',
    'Infinity',
    '1e8',
    '1,234',
    'abc'
  ])('blocks invalid monetary input %s', (amount) => {
    expect(creditFilterError({ minAmount: amount, currencyCode: 'USD' })).toBe('credits.invalidAmount');
  });
  it('allows a currency-only filter and rejects negative or missing-currency amounts', () => {
    expect(creditFilterError({ currencyCode: 'JPY' })).toBe('');
    expect(creditFilterError({ minAmount: '-0.01', currencyCode: 'USD' })).toBe(
      'labels.text.Amounts cannot be negative'
    );
    expect(creditFilterError({ minAmount: '0' })).toBe('credits.currencyRequired');
  });
  it('preserves calendar dates in arrays and ISO strings', () => {
    expect(
      creditCalendarDate([
        2026,
        11,
        18
      ]).format('YYYY-MM-DD')
    ).toBe('2026-11-18');
    expect(creditCalendarDate('2026-11-18').format('YYYY-MM-DD')).toBe('2026-11-18');
    expect(creditFilterError({ submittedFrom: new Date(2026, 10, 22), submittedTo: new Date(2026, 10, 1) })).toBe(
      'labels.text.From Date cannot be after To Date'
    );
  });
  it('uses authoritative status identifiers and never guesses from display text', () => {
    expect(creditStatusId({ status: { code: 'loanStatusType.active' } })).toBe(300);
    expect(creditStatusId({ status: { code: 'loanStatusType.withdrawn.by.client' } })).toBe(400);
    expect(creditStatusId({ status: { id: 999, value: 'Active' } })).toBe(999);
    expect(creditStatusId({ status: { value: 'Active' } })).toBeNaN();
  });
  it.each([
    '=WEBSERVICE("https://example.invalid")',
    '+SUM(A1:A2)',
    '-1+2',
    '@SUM(A1:A2)',
    '  =1+1',
    '\t=1',
    '\r=1',
    '\n=1'
  ])('neutralizes CSV formulas %s', (value) => {
    expect(creditCsvCell(value).startsWith('"\'')).toBe(true);
  });
  it('escapes quotes, separators and line breaks and preserves leading zeros as text', () => {
    expect(creditCsvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
    expect(creditCsvCell('0000042', true)).toBe('"\'0000042"');
    expect(creditCsvCell('123.45000001')).toBe('"123.45000001"');
  });
  it('keeps all supported locales complete with intact interpolation variables', () => {
    const directory = path.resolve(process.cwd(), 'src/assets/translations');
    const en = JSON.parse(fs.readFileSync(path.join(directory, 'en-US.json'), 'utf8')).credits;
    for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.json'))) {
      const translated = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')).credits;
      expect(Object.keys(translated).sort()).toEqual(Object.keys(en).sort());
      for (const key of Object.keys(en)) {
        expect(translated[key]).toBeTruthy();
        expect(translated[key].match(/{{\w+}}/g)?.sort()).toEqual(en[key].match(/{{\w+}}/g)?.sort());
      }
    }
  });
});
