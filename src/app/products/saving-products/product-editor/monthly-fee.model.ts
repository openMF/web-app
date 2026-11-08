/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isoDate, parseExactJson } from './interest-rate.model';

/** BE-07 evidence is diagnostic; these types contain no native posting receipt. */
export interface MonthlyFeeCapabilities {
  diagnosticAssessmentSupported: boolean;
  approvedAverageCalculationSupported: boolean;
  postingSupported: boolean;
  collectionSupported: boolean;
  diagnosticBatchAdapterSupported: boolean;
  productionScheduleSupported: boolean;
  accountingReconciliationSupported: boolean;
  reversalSupported: boolean;
  fullNativeCoverage: boolean;
  blockers: string[];
}
export interface MonthlyFeeRun {
  id: string;
  tenant: string;
  period: string;
  businessDate: string;
  status: string;
  cutoffAccountId: string;
  afterAccountId: string;
  evaluated: number;
  blocked: number;
  unknown: number;
  createdBy: string;
  createdAt: string;
}
export type MonthlyFeeOutcome = 'NOT_ELIGIBLE' | 'NO_FEE_CONFIGURED' | 'BLOCKED' | 'UNKNOWN_OUTCOME';
export interface MonthlyFeeAssessment {
  accountId: string;
  productId: string;
  period: string;
  policyVersion: string | null;
  minimumMonthlyAverageBalance: string | null;
  feeChargeId: string | null;
  configuredFeeAmount: string | null;
  outcome: string;
  reason: string;
  financialOutcome: string;
  assessedBy: string;
  recordedAt: string;
}
export interface MonthlyFeeAssessmentPage {
  items: MonthlyFeeAssessment[];
  nextAfterId: string;
  hasMore: boolean;
}
export interface MonthlyFeeRunHistory {
  items: MonthlyFeeRun[];
  nextBeforePeriod?: string | null;
  hasMore: boolean;
}
export interface MonthlyFeeReconciliation {
  runId: string;
  status: string;
  unknownOutcomes: number;
  nativeAccountingVerified: boolean;
  financialRetryAllowed: boolean;
}
export const MONTHLY_FEE_CAPABILITIES = [
  'diagnosticAssessmentSupported',
  'approvedAverageCalculationSupported',
  'postingSupported',
  'collectionSupported',
  'diagnosticBatchAdapterSupported',
  'productionScheduleSupported',
  'accountingReconciliationSupported',
  'reversalSupported',
  'fullNativeCoverage'
] as const;
const exactFields = [
  'accountId',
  'productId',
  'policyVersion',
  'feeChargeId',
  'configuredFeeAmount',
  'cutoffAccountId',
  'afterAccountId',
  'nextAfterId',
  'createdBy',
  'assessedBy'
];
export function parseMonthlyFeeJson(json: string): unknown {
  return parseExactJson(json, exactFields);
}
export function validFeePeriod(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  return year >= 1900 && year <= 9998;
}
/** The backend permits only the preceding completed tenant month; never use the browser clock. */
export function diagnosticPeriod(businessDate: string | null): string | null {
  if (!businessDate || !isoDate(businessDate)) return null;
  const year = Number(businessDate.slice(0, 4));
  const month = Number(businessDate.slice(5, 7));
  const period = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
  return validFeePeriod(period) ? period : null;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid diagnostic response');
  return value as Record<string, unknown>;
}
function requireFields(value: unknown, strings: string[], integers: string[] = [], booleans: string[] = []) {
  const data = record(value);
  if (
    strings.some((key) => typeof data[key] !== 'string' || !data[key]) ||
    integers.some((key) => !Number.isSafeInteger(data[key]) || (data[key] as number) < 0) ||
    booleans.some((key) => typeof data[key] !== 'boolean')
  )
    throw new Error('Invalid diagnostic response');
  return data;
}
function integerText(value: unknown): boolean {
  return typeof value === 'string' && /^(?:0|[1-9]\d*)$/.test(value) && BigInt(value) <= 9223372036854775807n;
}
function identifiers(data: Record<string, unknown>, keys: string[]) {
  if (keys.some((key) => !integerText(data[key]))) throw new Error('Invalid diagnostic identifier');
}
export function readFeeCapabilities(value: unknown): MonthlyFeeCapabilities {
  const data = requireFields(value, [], [], [...MONTHLY_FEE_CAPABILITIES]);
  if (!Array.isArray(data['blockers']) || !data['blockers'].every((v) => typeof v === 'string'))
    throw new Error('Invalid diagnostic blockers');
  return data as unknown as MonthlyFeeCapabilities;
}
export function readFeeRun(value: unknown): MonthlyFeeRun {
  const data = requireFields(
    value,
    [
      'id',
      'tenant',
      'period',
      'businessDate',
      'status',
      'createdAt'
    ],
    [
      'evaluated',
      'blocked',
      'unknown'
    ]
  );
  identifiers(data, [
    'cutoffAccountId',
    'afterAccountId',
    'createdBy'
  ]);
  if (
    !/^[a-zA-Z0-9-]{1,100}$/.test(data['id'] as string) ||
    !validFeePeriod(data['period']) ||
    !isoDate(data['businessDate'] as string)
  )
    throw new Error('Invalid diagnostic period');
  return data as unknown as MonthlyFeeRun;
}
export function readFeeHistory(value: unknown): MonthlyFeeRunHistory {
  const data = requireFields(value, [], [], ['hasMore']);
  if (!Array.isArray(data['items']) || (data['hasMore'] && !validFeePeriod(data['nextBeforePeriod'])))
    throw new Error('Invalid diagnostic history');
  return { ...data, items: data['items'].map(readFeeRun) } as MonthlyFeeRunHistory;
}
export function readFeePage(value: unknown): MonthlyFeeAssessmentPage {
  const data = requireFields(value, [], [], ['hasMore']);
  identifiers(data, ['nextAfterId']);
  if (!Array.isArray(data['items'])) throw new Error('Invalid assessment page');
  const items = data['items'].map((value): MonthlyFeeAssessment => {
    const item = requireFields(value, [
      'period',
      'outcome',
      'reason',
      'financialOutcome',
      'recordedAt'
    ]);
    identifiers(item, [
      'accountId',
      'productId',
      'assessedBy'
    ]);
    if (!validFeePeriod(item['period'])) throw new Error('Invalid assessment period');
    for (const key of [
      'policyVersion',
      'feeChargeId'
    ]) {
      if (item[key] != null && !integerText(item[key])) throw new Error('Invalid assessment reference');
    }
    for (const key of [
      'minimumMonthlyAverageBalance',
      'configuredFeeAmount'
    ]) {
      if (item[key] != null && (typeof item[key] !== 'string' || !/^\d+(?:\.\d+)?$/.test(item[key] as string)))
        throw new Error('Invalid assessment amount');
    }
    if (item['configuredFeeAmount'] != null && item['feeChargeId'] == null)
      throw new Error('Missing authoritative charge reference');
    return {
      ...item,
      policyVersion: item['policyVersion'] ?? null,
      feeChargeId: item['feeChargeId'] ?? null,
      minimumMonthlyAverageBalance: item['minimumMonthlyAverageBalance'] ?? null,
      configuredFeeAmount: item['configuredFeeAmount'] ?? null
    } as unknown as MonthlyFeeAssessment;
  });
  if (
    (data['hasMore'] && !items.length) ||
    items.some((item, index) => index > 0 && BigInt(item.accountId) <= BigInt(items[index - 1].accountId)) ||
    (items.length && data['nextAfterId'] !== items[items.length - 1].accountId)
  )
    throw new Error('Invalid assessment pagination');
  return { items, nextAfterId: data['nextAfterId'] as string, hasMore: data['hasMore'] as boolean };
}
export function readFeeReconciliation(value: unknown): MonthlyFeeReconciliation {
  return requireFields(
    value,
    [
      'runId',
      'status'
    ],
    ['unknownOutcomes'],
    [
      'nativeAccountingVerified',
      'financialRetryAllowed'
    ]
  ) as unknown as MonthlyFeeReconciliation;
}
