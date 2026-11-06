/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Exact decimal text is retained across forms, JSON reads, snapshots and writes. */
export interface InterestBracket {
  lowerBalance: string;
  upperBalance: string | null;
  annualRatePercent: string;
}
export interface InterestMatrix {
  calculationMethod: 'UNAPPROVED';
  brackets: InterestBracket[];
}
export interface ReferenceFormula {
  referenceId: string;
  referenceType: 'CETES';
  tenor: string;
  formulaMode: 'ADDITIVE_SPREAD' | 'MULTIPLICATIVE_FACTOR';
  spreadPercentagePoints: string | null;
  multiplier: string | null;
  reviewFrequency: 'DAILY' | 'END_OF_MONTH';
}
export interface InterestConfiguration<T> {
  savingsProductId: number;
  revision: number | null;
  status: string;
  financialOperational: boolean;
  blockers: string[];
  matrix?: T;
  formula?: T;
}
export interface ReferenceDefinition {
  referenceId: string;
  referenceType: 'CETES';
  tenor: string;
  sourceDescription: string;
  revision: number;
  makerId: number;
  createdAt: string;
}
export interface ReferenceTemplate {
  referenceTypes: string[];
  formulaModes: string[];
  reviewFrequencies: string[];
  fixingSelection: string;
  reviewSchedulingOperational: boolean;
  financialOperational: boolean;
  blockers: string[];
}
export interface BenchmarkCapture {
  expectedRevision: number;
  tenor: string;
  annualRatePercent: string;
  publicationDate: string;
  effectiveDate: string;
  sourceReference: string;
  note: string | null;
}
export interface BenchmarkFixing extends Omit<BenchmarkCapture, 'expectedRevision'> {
  referenceId: string;
  version: number;
  revision: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  baseVersion: number | null;
  makerId: number;
  submitterId: number | null;
  checkerId: number | null;
  capturedAt: string;
  submittedAt: string | null;
  decidedAt: string | null;
  reason: string | null;
}
export interface BenchmarkAudit {
  id: number;
  referenceId: string;
  version: number;
  action: string;
  actorId: number;
  recordedAt: string;
  previousState: string;
  newState: string;
  reason: string | null;
}
export interface RatePreview extends Omit<ReferenceFormula, 'referenceId'> {
  savingsProductId: number;
  policyVersion: number;
  policyEffectiveDate: string;
  referenceId: string;
  benchmarkVersion: number;
  publicationDate: string;
  benchmarkEffectiveDate: string;
  businessDate: string;
  benchmarkAnnualRatePercent: string;
  calculatedAnnualRatePercent: string;
  calculationStatus: string;
  financialOperational: boolean;
  blockers: string[];
}
export interface BracketSelection {
  savingsProductId: number;
  policyVersion: number;
  businessDate: string;
  currencyCode: string;
  currencyDigits: number;
  bracketIndex: number;
  bracket: InterestBracket;
  calculationStatus: string;
  financialOperational: boolean;
}
export function decimal(value: unknown, scale = 12, signed = false, trimZeroes = false): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\-?)(\d+)(?:\.(\d+))?$/.exec(value);
  return (
    !!match &&
    (signed || !match[1]) &&
    match[2].replace(/^0+/, '').length <= 13 &&
    (trimZeroes ? (match[3] || '').replace(/0+$/, '') : match[3] || '').length <= scale
  );
}
const decimalFields = new Set([
  'maximumBalance',
  'minimumMonthlyAverageBalance',
  'lowerBalance',
  'upperBalance',
  'annualRatePercent',
  'spreadPercentagePoints',
  'multiplier',
  'calculatedAnnualRatePercent',
  'benchmarkAnnualRatePercent',
  'nominalAnnualRatePreview',
  'nominalAnnualRate'
]);
/** Tokenize strings before numbers, so text containing JSON-like fragments cannot be rewritten. */
export function parseExactJson<T>(json: string): T {
  const tokens = json.match(/"(?:[^"\\]|\\.)*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\]:,]|\s+|./g) || [];
  let key = '',
    afterColon = false;
  const output = tokens.map((token) => {
    if (/^\s+$/.test(token)) return token;
    if (token === ':') {
      afterColon = true;
      return token;
    }
    if (afterColon && decimalFields.has(key) && /^-?\d/.test(token)) {
      afterColon = false;
      return JSON.stringify(plainDecimal(token));
    }
    afterColon = false;
    key = token.startsWith('"') ? JSON.parse(token) : '';
    return token;
  });
  return JSON.parse(output.join('')) as T;
}
function plainDecimal(token: string): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(token);
  if (!match) throw new Error('Invalid decimal response');
  const exponent = Number(match[4] || 0);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 100) throw new Error('Unsupported decimal exponent');
  const digits = match[2] + (match[3] || '');
  const point = match[2].length + exponent;
  const result =
    point <= 0
      ? '0.' + '0'.repeat(-point) + digits
      : point >= digits.length
        ? digits + '0'.repeat(point - digits.length)
        : digits.slice(0, point) + '.' + digits.slice(point);
  return match[1] + result.replace(/^0+(?=\d)/, '');
}
/** Serialize only recognized decimal fields as plain numeric literals, never via Number. */
export function serializeExactJson(value: unknown): string {
  const encode = (item: unknown, key = ''): string => {
    if (item == null) return 'null';
    if (decimalFields.has(key)) {
      if (!decimal(item, 12, true)) throw new Error('Invalid decimal: ' + key);
      return item.replace(/^(-?)0+(?=\d)/, '$1');
    }
    if (Array.isArray(item)) return '[' + item.map((entry) => encode(entry)).join(',') + ']';
    if (typeof item === 'object')
      return (
        '{' +
        Object.entries(item)
          .filter(
            ([
              ,
              v
            ]) => v !== undefined
          )
          .map(
            ([
              k,
              v
            ]) => JSON.stringify(k) + ':' + encode(v, k)
          )
          .join(',') +
        '}'
      );
    if (typeof item === 'number' && !Number.isSafeInteger(item)) throw new Error('Unsafe numeric field: ' + key);
    if (![
        'string',
        'boolean',
        'number'
      ].includes(typeof item)) throw new Error('Unsupported JSON value');
    return JSON.stringify(item);
  };
  return encode(value);
}
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    throw new Error('Incompatible advanced policy response');
  return value as Record<string, unknown>;
}
export function readMatrix(value: unknown): InterestMatrix | null {
  if (value == null) return null;
  const m = record(value, [
    'calculationMethod',
    'brackets'
  ]);
  if (
    m.calculationMethod !== 'UNAPPROVED' ||
    !Array.isArray(m.brackets) ||
    m.brackets.length < 1 ||
    m.brackets.length > 50
  )
    throw new Error('Incompatible interest matrix');
  return {
    calculationMethod: 'UNAPPROVED',
    brackets: m.brackets.map((value) => {
      const b = record(value, [
        'lowerBalance',
        'upperBalance',
        'annualRatePercent'
      ]);
      // Fineract's JSON provider omits null properties, including an unbounded upper balance.
      if (
        !decimal(b.lowerBalance) ||
        (b.upperBalance != null && !decimal(b.upperBalance)) ||
        !decimal(b.annualRatePercent)
      )
        throw new Error('Invalid interest matrix decimal');
      return {
        lowerBalance: b.lowerBalance,
        upperBalance: (b.upperBalance as string) ?? null,
        annualRatePercent: b.annualRatePercent
      };
    })
  };
}
export function readFormula(value: unknown): ReferenceFormula | null {
  if (value == null) return null;
  const f = record(value, [
    'referenceId',
    'referenceType',
    'tenor',
    'formulaMode',
    'spreadPercentagePoints',
    'multiplier',
    'reviewFrequency'
  ]);
  if (!identifier(f.referenceId) || !identifier(f.tenor) || f.referenceType !== 'CETES' || ![
      'ADDITIVE_SPREAD',
      'MULTIPLICATIVE_FACTOR'
    ].includes(String(f.formulaMode)) || ![
      'DAILY',
      'END_OF_MONTH'
    ].includes(String(f.reviewFrequency))) throw new Error('Incompatible reference formula');
  const additive = f.formulaMode === 'ADDITIVE_SPREAD';
  if (
    additive
      ? !decimal(f.spreadPercentagePoints, 12, true) || f.multiplier != null
      : !decimal(f.multiplier) || /^0*(?:\.0*)?$/.test(String(f.multiplier)) || f.spreadPercentagePoints != null
  )
    throw new Error('Invalid formula parameter');
  return {
    referenceId: f.referenceId,
    referenceType: 'CETES',
    tenor: f.tenor,
    formulaMode: f.formulaMode as ReferenceFormula['formulaMode'],
    spreadPercentagePoints: (f.spreadPercentagePoints as string) ?? null,
    multiplier: (f.multiplier as string) ?? null,
    reviewFrequency: f.reviewFrequency as ReferenceFormula['reviewFrequency']
  };
}
export function identifier(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_-]{0,63}$/.test(value);
}
export function isoDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.slice(0, 4) === '0000') return false;
  const date = new Date(value + 'T00:00:00Z');
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
/** Integer strings implement the smallest currency unit; no floating point boundary arithmetic. */
function units(value: string, digits: number): bigint {
  const [
    whole,
    fraction = ''
  ] = value.split('.');
  return BigInt(whole + fraction.padEnd(digits, '0').slice(0, digits));
}
export interface MatrixIssue {
  row?: number;
  field: string;
  key: string;
}
export function validateMatrix(matrix: InterestMatrix, digits: number, maximum: string): MatrixIssue[] {
  const issues: MatrixIssue[] = [];
  const fail = (field: string, key: string, row?: number) =>
    issues.push({ row, field, key: 'InterestManagement.' + key });
  if (!Number.isInteger(digits) || digits < 0 || digits > 6 || !decimal(maximum, digits, false, true)) {
    fail('matrix', 'CurrencyInvalid');
    return issues;
  }
  if (matrix.calculationMethod !== 'UNAPPROVED') fail('calculationMethod', 'Semantics');
  if (!matrix.brackets.length || matrix.brackets.length > 50) fail('brackets', 'RowCount');
  let next: bigint | null = 0n;
  const max = units(maximum, digits);
  matrix.brackets.forEach((b, row) => {
    const lower = decimal(b.lowerBalance, digits, false, true);
    const upper = b.upperBalance === null || decimal(b.upperBalance, digits, false, true);
    if (!lower) fail('lowerBalance', 'BalanceInvalid', row);
    if (!upper) fail('upperBalance', 'BalanceInvalid', row);
    if (!decimal(b.annualRatePercent, 6, false, true)) fail('annualRatePercent', 'RateInvalid', row);
    if (lower) {
      const l = units(b.lowerBalance, digits);
      if (next === null || l !== next) fail('lowerBalance', 'Continuity', row);
      if (l > max) fail('lowerBalance', 'Maximum', row);
      if (upper && b.upperBalance !== null && l > units(b.upperBalance, digits))
        fail('upperBalance', 'UpperBelow', row);
    }
    if (b.upperBalance === null) {
      if (row !== matrix.brackets.length - 1) fail('upperBalance', 'UnboundedLast', row);
      next = null;
    } else if (upper) {
      const u = units(b.upperBalance, digits);
      if (u > max || (row === matrix.brackets.length - 1 && u !== max)) fail('upperBalance', 'Coverage', row);
      next = u + 1n;
    } else next = null;
  });
  return issues;
}
