/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormBuilder } from '@angular/forms';
import {
  InterestMatrix,
  decimal,
  isoDate,
  parseExactJson,
  readFormula,
  readMatrix,
  serializeExactJson,
  validateMatrix
} from './interest-rate.model';
import { createPolicyForm, normalizedPolicy, serializePolicy } from './product-policy.model';
import { policy } from './product-policy.fixtures';

import { matrix, formula } from './interest-rate.fixtures';

describe('exact interest transport and preservation', () => {
  it.each([
    '1000.0000000001',
    '9999999999999.999999999999',
    '0',
    '0001.20'
  ])('retains all decimal digits of %s', (value) => {
    const json = serializeExactJson({ multiplier: value });
    expect(json).toBe('{"multiplier":' + value.replace(/^0+(?=\d)/, '') + '}');
    expect(parseExactJson<{ multiplier: string }>(json).multiplier).toBe(value.replace(/^0+(?=\d)/, ''));
  });
  it.each([
    'NaN',
    'Infinity',
    '1e3',
    '1,000',
    '.5',
    '1;null',
    '1.1234567890123',
    '10000000000000'
  ])('rejects malformed wire decimal %s', (value) => {
    expect(() => serializeExactJson({ annualRatePercent: value })).toThrow();
  });
  it('does not replace numbers embedded in notes or escaped property names inside strings', () => {
    const note = 'A note: "annualRatePercent":123.456 and a slash \n';
    const wire = '{"note":' + JSON.stringify(note) + ',"annualRatePercent":1000.0000000001}';
    expect(parseExactJson<{ note: string; annualRatePercent: string }>(wire)).toEqual({
      note,
      annualRatePercent: '1000.0000000001'
    });
  });
  it('expands scientific response tokens exactly before parsing, but never emits exponents', () => {
    expect(parseExactJson('{"annualRatePercent":1.234E-8,"multiplier":1.20E+2}')).toEqual({
      annualRatePercent: '0.00000001234',
      multiplier: '120'
    });
    expect(() => parseExactJson('{"annualRatePercent":1e10000}')).toThrow();
    expect(() => serializeExactJson({ revision: 9007199254740992 })).toThrow();
  });
  it('preserves both typed advanced fields through unrelated form changes and full-policy serialization', () => {
    const form = createPolicyForm(new FormBuilder());
    form.reset({ ...policy, interestMatrix: matrix, referenceRate: formula });
    form.controls.accountDesignation.setValue('Changed basic field');
    const result = parseExactJson<{ policy: typeof policy }>(serializePolicy(5, normalizedPolicy(form)));
    expect(result.policy.interestMatrix).toEqual(matrix);
    expect(result.policy.referenceRate).toEqual(formula);
    expect(result.policy.accountDesignation).toBe('Changed basic field');
  });
  it('changing one advanced value preserves the other, without arbitrary JSON merging', () => {
    const form = createPolicyForm(new FormBuilder());
    form.reset({ ...policy, interestMatrix: matrix, referenceRate: formula });
    form.controls.referenceRate.setValue({ ...formula, spreadPercentagePoints: '1000.0000000001' });
    expect(normalizedPolicy(form).interestMatrix).toEqual(matrix);
    form.controls.interestMatrix.setValue({
      ...matrix,
      brackets: [{ lowerBalance: '0', upperBalance: null, annualRatePercent: '3' }]
    });
    expect(normalizedPolicy(form).referenceRate.spreadPercentagePoints).toBe('1000.0000000001');
    expect(() => readMatrix({ ...matrix, unknownFutureSemantics: true })).toThrow();
    expect(() => readFormula({ ...formula, extra: {} })).toThrow();
  });
  it('does not fabricate missing configurations; normalizes omitted backend null parameters', () => {
    expect(readMatrix(undefined)).toBeNull();
    expect(readFormula(null)).toBeNull();
    expect(
      readMatrix({ calculationMethod: 'UNAPPROVED', brackets: [{ lowerBalance: '0', annualRatePercent: '1' }] })
        .brackets[0].upperBalance
    ).toBeNull();
    const f = { ...formula };
    delete f.multiplier;
    expect(readFormula(f).multiplier).toBeNull();
    expect(() => readMatrix({ ...matrix, calculationMethod: 'WHOLE_BALANCE' })).toThrow();
    expect(() => readFormula({ ...formula, multiplier: '1' })).toThrow();
    expect(() =>
      readFormula({ ...formula, formulaMode: 'MULTIPLICATIVE_FACTOR', spreadPercentagePoints: null, multiplier: '0' })
    ).toThrow();
  });
});
describe('currency-aware inclusive bracket validation', () => {
  const validate = (m: InterestMatrix, digits = 2, max = '10000') => validateMatrix(m, digits, max);
  it('accepts ordered continuous inclusive brackets', () => expect(validate(matrix)).toEqual([]));
  it.each([
    0,
    1,
    2,
    3,
    6
  ])('uses currency precision %s to determine the next unit', (digits) => {
    const step = digits ? '1.' + '0'.repeat(digits - 1) + '1' : '2';
    expect(
      validate(
        {
          ...matrix,
          brackets: [
            { lowerBalance: '0', upperBalance: '1', annualRatePercent: '1' },
            { lowerBalance: step, upperBalance: '10000', annualRatePercent: '2' }
          ]
        },
        digits
      )
    ).toEqual([]);
  });
  it('accepts an unbounded final bracket, even with a finite policy maximum', () => {
    expect(
      validate({ ...matrix, brackets: [{ lowerBalance: '0', upperBalance: null, annualRatePercent: '1' }] })
    ).toEqual([]);
  });
  it.each([
    [
      'lowerBalance',
      '-1',
      'BalanceInvalid'
    ],
    [
      'lowerBalance',
      '0.001',
      'BalanceInvalid'
    ],
    [
      'lowerBalance',
      '0.01',
      'Continuity'
    ],
    [
      'lowerBalance',
      '10000.01',
      'Maximum'
    ],
    [
      'upperBalance',
      '-1',
      'BalanceInvalid'
    ],
    [
      'upperBalance',
      '10000.01',
      'Coverage'
    ],
    [
      'annualRatePercent',
      '',
      'RateInvalid'
    ],
    [
      'annualRatePercent',
      '1.0000001',
      'RateInvalid'
    ],
    [
      'annualRatePercent',
      '-1',
      'RateInvalid'
    ]
  ])('rejects %s=%s', (field, value, key) => {
    const m = {
      ...matrix,
      brackets: [{ lowerBalance: '0', upperBalance: '10000', annualRatePercent: '1', [field]: value }]
    };
    expect(validate(m).some((i) => i.key === 'InterestManagement.' + key && i.row === 0)).toBe(true);
  });
  it.each([
    '1000',
    '1000.02',
    '999'
  ])('rejects overlap, gaps and unsorted ranges at %s', (lowerBalance) => {
    expect(
      validate({ ...matrix, brackets: [
          matrix.brackets[0],
          { ...matrix.brackets[1], lowerBalance }
        ] }).some((i) => i.key.endsWith('Continuity'))
    ).toBe(true);
  });
  it('rejects invalid final coverage, reversed ranges, null middle and row counts', () => {
    expect(
      validate({ ...matrix, brackets: [{ lowerBalance: '0', upperBalance: '9999.99', annualRatePercent: '1' }] }).some(
        (i) => i.key.endsWith('Coverage')
      )
    ).toBe(true);
    expect(
      validate({ ...matrix, brackets: [
          matrix.brackets[0],
          { lowerBalance: '1000.01', upperBalance: '1000', annualRatePercent: '1' }
        ] }).some((i) => i.key.endsWith('UpperBelow'))
    ).toBe(true);
    expect(
      validate({ ...matrix, brackets: [
          { ...matrix.brackets[0], upperBalance: null },
          matrix.brackets[1]
        ] }).some((i) => i.key.endsWith('UnboundedLast'))
    ).toBe(true);
    expect(validate({ ...matrix, brackets: [] })[0].key).toBe('InterestManagement.RowCount');
    expect(validate({ ...matrix, brackets: Array(51).fill(matrix.brackets[0]) })[0].key).toBe(
      'InterestManagement.RowCount'
    );
    expect(validate(matrix, 7)[0].key).toBe('InterestManagement.CurrencyInvalid');
  });
  it('rejects unsupported decimal and date formats without locale conversion', () => {
    expect(decimal('1,20')).toBe(false);
    expect(decimal('-1', 12, true)).toBe(true);
    expect(isoDate('2026-02-30')).toBe(false);
    expect(isoDate('2028-02-29')).toBe(true);
    expect(isoDate('0000-01-01')).toBe(false);
  });
});
