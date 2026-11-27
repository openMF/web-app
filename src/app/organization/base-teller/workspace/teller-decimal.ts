/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Exact decimal arithmetic for teller cash figures.
 *
 * Backend amounts arrive as JSON numbers (serialised `BigDecimal`). Adding or comparing them as IEEE doubles can
 * drift (0.1 + 0.2), which is unacceptable for reconciliation and limit checks. A {@link Decimal} stores the value as
 * a scaled BigInt (`value = units / 10^scale`), so every operation here is exact.
 */
export interface Decimal {
  readonly units: bigint;
  readonly scale: number;
}

const DECIMAL_PATTERN = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;
/** Guards against pathological exponents such as `1e999999999` allocating huge BigInts. */
const MAX_SCALE = 30;

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

/**
 * Parses a finite JSON number or decimal string. Returns `null` for anything that is not a plain decimal, so callers
 * can distinguish "unknown" from zero instead of silently showing `0.00`.
 */
export function toDecimal(value: number | string | null | undefined): Decimal | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return null;
  }
  const text = (typeof value === 'number' ? String(value) : value).trim();
  const match = DECIMAL_PATTERN.exec(text);
  if (!match) {
    return null;
  }
  const [
    ,
    sign,
    integerPart,
    fractionPart = '',
    exponentPart
  ] = match;
  if (integerPart === '' && fractionPart === '') {
    return null;
  }
  const exponent = exponentPart ? Number(exponentPart) : 0;
  let digits = `${integerPart}${fractionPart}`.replace(/^0+(?=\d)/, '');
  let scale = fractionPart.length - exponent;
  if (scale < 0) {
    digits = digits + '0'.repeat(-scale);
    scale = 0;
  }
  if (scale > MAX_SCALE || digits.length > 60) {
    return null;
  }
  const units = BigInt(digits === '' ? '0' : digits);
  return { units: sign === '-' ? -units : units, scale };
}

function rescale(value: Decimal, scale: number): bigint {
  return value.units * pow10(scale - value.scale);
}

function commonScale(a: Decimal, b: Decimal): number {
  return Math.max(a.scale, b.scale);
}

export function addDecimal(a: Decimal, b: Decimal): Decimal {
  const scale = commonScale(a, b);
  return { units: rescale(a, scale) + rescale(b, scale), scale };
}

export function subtractDecimal(a: Decimal, b: Decimal): Decimal {
  const scale = commonScale(a, b);
  return { units: rescale(a, scale) - rescale(b, scale), scale };
}

/** Returns a negative number, zero or a positive number like `Array.prototype.sort` comparators. */
export function compareDecimal(a: Decimal, b: Decimal): number {
  const scale = commonScale(a, b);
  const left = rescale(a, scale);
  const right = rescale(b, scale);
  return left < right ? -1 : left > right ? 1 : 0;
}

export function isZeroDecimal(value: Decimal): boolean {
  return value.units === 0n;
}

export function isNegativeDecimal(value: Decimal): boolean {
  return value.units < 0n;
}

export function negateDecimal(value: Decimal): Decimal {
  return { units: -value.units, scale: value.scale };
}

export function absDecimal(value: Decimal): Decimal {
  return value.units < 0n ? negateDecimal(value) : value;
}

/**
 * True when `value / base * 100 >= percent`, evaluated by cross-multiplication so there is no rounding at the
 * boundary (exactly 80% of the limit counts as 80%, 79.999...% does not).
 *
 * `base` must be positive.
 */
export function atLeastPercent(value: Decimal, base: Decimal, percent: Decimal): boolean {
  if (base.units <= 0n) {
    return false;
  }
  const scale = Math.max(commonScale(value, base), percent.scale);
  const left = rescale(value, scale) * 100n * pow10(percent.scale);
  const right = rescale(base, scale) * percent.units;
  return left >= right;
}

/**
 * Whole-number percentage of `value` relative to `base`, rounded down so the UI never displays 100% before the limit
 * is actually reached. Negative values clamp to 0. Returns `null` when `base` is not positive.
 */
export function floorPercent(value: Decimal, base: Decimal): number | null {
  if (base.units <= 0n) {
    return null;
  }
  const scale = commonScale(value, base);
  const numerator = rescale(value, scale);
  if (numerator <= 0n) {
    return 0;
  }
  return Number((numerator * 100n) / rescale(base, scale));
}

/** Plain decimal string with every digit preserved, safe to hand to `Intl.NumberFormat#format` as a string. */
export function decimalToString(value: Decimal): string {
  const negative = value.units < 0n;
  const digits = (negative ? -value.units : value.units).toString().padStart(value.scale + 1, '0');
  const integerDigits = digits.slice(0, digits.length - value.scale);
  const fractionDigits = digits.slice(digits.length - value.scale);
  return `${negative ? '-' : ''}${integerDigits}${fractionDigits ? `.${fractionDigits}` : ''}`;
}
