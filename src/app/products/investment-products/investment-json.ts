/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const decimalFields = new Set([
  'minimumInvestmentAmount',
  'maximumInvestmentAmount',
  'minimumDepositAmount',
  'maximumDepositAmount',
  'defaultDepositAmount',
  'interest',
  'lower',
  'upper',
  'annualRatePercent',
  'investmentAmount',
  'previousRate',
  'newRate'
]);

/** Plain, nonnegative decimal; no binary floating point or silent rounding. */
export function isDecimal(value: unknown, scale: number): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(value);
  return !!match && match[1].length <= 13 && (match[2] || '').replace(/0+$/, '').length <= scale;
}
export function compareDecimal(a: string, b: string): number {
  if (!isDecimal(a, 12) || !isDecimal(b, 12)) throw new Error('Investment.invalidDecimal');
  const [
    ai,
    af = ''
  ] = a.split('.');
  const [
    bi,
    bf = ''
  ] = b.split('.');
  const scale = Math.max(af.length, bf.length);
  const left = BigInt(ai + af.padEnd(scale, '0'));
  const right = BigInt(bi + bf.padEnd(scale, '0'));
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Structured serialization: decimal fields alone are emitted as validated numeric tokens. */
export function serializeInvestmentJson(value: unknown, field = ''): string {
  if (value === null) return 'null';
  if (decimalFields.has(field)) {
    if (!isDecimal(value, 12)) throw new Error('Investment.invalidDecimal');
    return value;
  }
  if (Array.isArray(value)) return '[' + value.map((item) => serializeInvestmentJson(item)).join(',') + ']';
  if (typeof value === 'object') {
    return (
      '{' +
      Object.entries(value)
        .map(
          ([
            key,
            item
          ]) => JSON.stringify(key) + ':' + serializeInvestmentJson(item, key)
        )
        .join(',') +
      '}'
    );
  }
  if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new Error('Investment.invalidInteger');
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return JSON.stringify(value);
  throw new Error('Investment.invalidResponse');
}

/** Parse the JSON grammar before numeric conversion. Quoted text is never rewritten. */
export function parseInvestmentJson<T>(source: string): T {
  let position = 0;
  const fail = (): never => {
    throw new Error('Investment.invalidResponse');
  };
  const whitespace = () => {
    while (/\s/.test(source[position] || '') && position < source.length) position++;
  };
  function quoted(): string {
    const start = position++;
    while (position < source.length) {
      const char = source[position++];
      if (char === '\\') position++;
      else if (char === '"') return JSON.parse(source.slice(start, position));
    }
    return fail();
  }
  function read(field = ''): unknown {
    whitespace();
    if (source[position] === '"') return quoted();
    if (source[position] === '{') {
      position++;
      const result: Record<string, unknown> = Object.create(null);
      whitespace();
      if (source[position] === '}') {
        position++;
        return result;
      }
      while (position < source.length) {
        whitespace();
        if (source[position] !== '"') return fail();
        const key = quoted();
        if (Object.hasOwn(result, key)) return fail();
        whitespace();
        if (source[position++] !== ':') return fail();
        result[key] = read(key);
        whitespace();
        const end = source[position++];
        if (end === '}') return result;
        if (end !== ',') return fail();
      }
      return fail();
    }
    if (source[position] === '[') {
      position++;
      const result: unknown[] = [];
      whitespace();
      if (source[position] === ']') {
        position++;
        return result;
      }
      while (position < source.length) {
        result.push(read());
        whitespace();
        const end = source[position++];
        if (end === ']') return result;
        if (end !== ',') return fail();
      }
      return fail();
    }
    for (const [
      literal,
      value
    ] of [
      [
        'null',
        null
      ],
      [
        'true',
        true
      ],
      [
        'false',
        false
      ]
    ] as const) {
      if (source.startsWith(literal, position)) {
        position += literal.length;
        return value;
      }
    }
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(position));
    if (!match) return fail();
    const token = match[0];
    position += token.length;
    if (decimalFields.has(field)) {
      if (token.includes('e') || token.includes('E')) {
        // BigDecimal may use scientific notation. Expand lexically, retaining all digits.
        const negative = token.startsWith('-');
        const [
          coefficient,
          exponent
        ] = (negative ? token.slice(1) : token).toLowerCase().split('e');
        const [
          whole,
          fraction = ''
        ] = coefficient.split('.');
        const point = whole.length + Number(exponent);
        if (Math.abs(point) > 100) return fail();
        const digits = whole + fraction;
        const expanded =
          point <= 0
            ? '0.' + '0'.repeat(-point) + digits
            : point >= digits.length
              ? digits + '0'.repeat(point - digits.length)
              : digits.slice(0, point) + '.' + digits.slice(point);
        return (negative ? '-' : '') + expanded.replace(/^0+(?=\d)/, '');
      }
      return token;
    }
    const value = Number(token);
    if (!Number.isSafeInteger(value)) return fail();
    return value;
  }
  const result = read();
  whitespace();
  if (position !== source.length) return fail();
  return result as T;
}
