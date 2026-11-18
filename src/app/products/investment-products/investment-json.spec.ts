/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { compareDecimal, isDecimal, parseInvestmentJson, serializeInvestmentJson } from './investment-json';
describe('investment exact decimal wire codec', () => {
  test.each([
    '0.1',
    '7.125',
    '14.000001',
    '999999999999.99'
  ])('preserves numeric token %s across a round trip', (decimal) => {
    const json = serializeInvestmentJson({ annualRatePercent: decimal, name: 'Rate "annualRatePercent": 0.1' });
    expect(json).toContain('"annualRatePercent":' + decimal);
    expect(json).not.toContain('"annualRatePercent":"');
    expect(parseInvestmentJson(json)).toEqual({ annualRatePercent: decimal, name: 'Rate "annualRatePercent": 0.1' });
  });
  test.each([
    '1e2',
    '-1',
    '+1',
    '.5',
    '1,000',
    '01',
    'NaN',
    '10000000000000',
    '1.0000001'
  ])('rejects invalid or excessive rate precision %s', (value) => expect(isDecimal(value, 6)).toBe(false));
  it('allows trailing zeros without rounding or changing their representation', () => {
    expect(isDecimal('7.120000000', 2)).toBe(true);
    expect(serializeInvestmentJson({ lower: '7.120000000' })).toBe('{"lower":7.120000000}');
  });
  it('expands signed native penalty decimals and scientific zero exactly', () => {
    expect(parseInvestmentJson('{"interest":-1.25E+2,"lower":0E+5}')).toEqual({ interest: '-125', lower: '0' });
  });
  it('compares beyond binary decimal precision', () => {
    expect(compareDecimal('999999999999.99', '999999999999.98')).toBe(1);
    expect(compareDecimal('0.10', '0.1')).toBe(0);
  });
  it('parses scientific BigDecimal notation without Number conversion', () =>
    expect(parseInvestmentJson('{"annualRatePercent":1.4000001E+1,"lower":1E-7}')).toEqual({
      annualRatePercent: '14.000001',
      lower: '0.0000001'
    }));
  test.each([
    '{"revision":9007199254740993}',
    '{"revision":1,"revision":2}',
    '{"lower":1} trailing',
    '{"lower":1,}',
    '[1,]',
    '{"lower":01}'
  ])('rejects malformed or unsafe JSON %s', (json) => expect(() => parseInvestmentJson(json)).toThrow());
  it('does not serialize arbitrary JSON-looking text as numeric tokens', () => {
    expect(JSON.parse(serializeInvestmentJson({ name: '"lower":"100", "admin":true' })).name).toBe(
      '"lower":"100", "admin":true'
    );
    expect(() => serializeInvestmentJson({ lower: '1,"admin":true' })).toThrow();
  });
});
