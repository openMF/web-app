/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { parseAccountResponse, toMinorUnits } = require('./acceptance-money.cjs') as {
  parseAccountResponse: (text: string) => { summary: { accountBalance: string }; accountId: number };
  toMinorUnits: (value: string, decimalPlaces: number) => bigint;
};

describe('real transfer acceptance decimal balance comparisons', () => {
  it('preserves exact decimal and integer JSON balance tokens without changing IDs', () => {
    const parsed = parseAccountResponse('{"summary":{"accountBalance":9999999999999.99},"accountId":7}');
    expect(parsed.summary.accountBalance).toBe('9999999999999.99');
    expect(parsed.accountId).toBe(7);
    expect(parseAccountResponse('{"summary":{"accountBalance":100},"accountId":7}').summary.accountBalance).toBe('100');
  });
  it.each([
    [
      '100.10',
      2,
      10010n
    ],
    [
      '99.10',
      2,
      9910n
    ],
    [
      '0.000001',
      6,
      1n
    ],
    [
      '100',
      0,
      100n
    ],
    [
      '-0.10',
      2,
      -10n
    ],
    [
      '100.100000',
      2,
      10010n
    ],
    [
      '1.001e2',
      2,
      10010n
    ],
    [
      '1e-6',
      6,
      1n
    ],
    [
      '0E-8',
      2,
      0n
    ],
    [
      '9999999999999.99',
      2,
      999999999999999n
    ]
  ] as const)('converts %s at currency scale %s exactly', (value, scale, expected) => {
    expect(toMinorUnits(value, scale)).toBe(expected);
  });
  it('checks fractional debits and credits without floating-point addition or subtraction', () => {
    const unit = toMinorUnits('1', 2);
    expect(toMinorUnits('0.10', 2)).toBe(toMinorUnits('1.10', 2) - unit);
    expect(toMinorUnits('99.10', 2)).toBe(toMinorUnits('100.10', 2) - unit);
    expect(toMinorUnits('101.10', 2)).toBe(toMinorUnits('100.10', 2) + unit);
  });
  it.each([
    'NaN',
    'Infinity',
    '',
    '1.001'
  ])('rejects invalid or excessive precision %s', (value) => {
    expect(() => toMinorUnits(value, 2)).toThrow();
  });
});
