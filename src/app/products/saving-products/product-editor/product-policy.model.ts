/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  InterestMatrix,
  ReferenceFormula,
  readMatrix,
  readFormula,
  parseExactJson,
  serializeExactJson
} from './interest-rate.model';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';

export type Classification = 'SIGHT' | 'INTEREST_BEARING_SIGHT' | 'SAVINGS';
export type Purpose = 'MAIN' | 'GUARANTEED' | 'PLANNED_MAIN' | 'POCKET';
export type InterestMode = 'NONE' | 'FIXED' | 'TIERED' | 'REFERENCE_RATE';
export type Freezing = 'NONE' | 'TERM' | 'LOAN_RELEASE';
export type Multiplicity = 'SINGLE' | 'UNLIMITED';

/** Money stays decimal text in the client. The wire serializer emits exact JSON number literals. */
export interface ProductPolicy {
  classification: Classification;
  purpose: Purpose;
  withdrawalsAllowed: boolean;
  depositsAllowed: boolean;
  liquidGuarantee: boolean;
  maximumBalance: string;
  minimumMonthlyAverageBalance: string;
  feeApplicable: boolean;
  feeChargeId: number | null;
  freezing: Freezing;
  freezingTermDays: number | null;
  directDebitForLoanPayment: boolean;
  multiplicity: Multiplicity;
  accountDesignation: string;
  additionalPaymentReference: boolean;
  paymentReferencePartner: string | null;
  interestMode: InterestMode;
  interestMatrix?: InterestMatrix | null;
  referenceRate?: ReferenceFormula | null;
}
export interface PolicyCapabilities {
  draftConfiguration: boolean;
  activation: boolean;
  financialEnforcement: boolean;
  clabeGeneration: boolean;
  classifications: Classification[];
  purposes: Purpose[];
  multiplicities: Multiplicity[];
  freezingModes: Freezing[];
  interestModes: InterestMode[];
  pendingFeatures: string[];
}
export interface PolicyConfiguration {
  savingsProductId: number;
  revision: number | null;
  status: 'DRAFT' | 'UNCONFIGURED';
  operational: boolean;
  policy: ProductPolicy | null;
  capabilities: PolicyCapabilities;
}
export interface PolicyVersion {
  savingsProductId: number;
  version: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'SUPERSEDED';
  effectiveDate: string;
  baseVersion: number | null;
  makerId: number;
  checkerId: number | null;
  submittedAt: string;
  decidedAt: string | null;
  reason: string | null;
  policy: ProductPolicy;
  coreSettings: Record<string, unknown>;
}
export interface PolicyReview {
  proposed: PolicyVersion;
  active: PolicyVersion | null;
  changedFields: string[];
}
export interface PolicyAudit {
  id: number;
  version: number;
  action: string;
  actorId: number | null;
  recordedAt: string;
  previousState: string | null;
  newState: string;
  effectiveDate: string | null;
  reason: string | null;
}
export interface PolicyCharge {
  id: number;
  name: string;
  active: boolean;
  penalty: boolean;
  currency: { code: string };
  chargeAppliesTo: { id: number };
  chargeTimeType: { id: number };
  chargeCalculationType: { id: number };
}
export interface PolicyCoreContext {
  currency: string;
  digits: number;
  opening: string;
  rate: string;
}

/** No numeric arithmetic on amounts; normalization removes insignificant zeroes only for comparison. */
export function validMoney(value: unknown, digits: number): boolean {
  if (!Number.isInteger(digits) || digits < 0) return false;
  const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value));
  return (
    !!match &&
    match[1].replace(/^0+/, '').length <= 13 &&
    (match[2] || '').replace(/0+$/, '').length <= Math.min(digits, 6)
  );
}
export function compareMoney(left: string, right: string): number {
  const parts = (value: string) => {
    const [
      integer,
      fraction = ''
    ] = String(value).split('.');
    return [
      integer.replace(/^0+(?=\d)/, ''),
      fraction
    ];
  };
  const [
      a,
      af
    ] = parts(left),
    [
      b,
      bf
    ] = parts(right);
  if (a.length !== b.length) return a.length < b.length ? -1 : 1;
  if (a !== b) return a < b ? -1 : 1;
  const width = Math.max(af.length, bf.length);
  return af.padEnd(width, '0') === bf.padEnd(width, '0') ? 0 : af.padEnd(width, '0') < bf.padEnd(width, '0') ? -1 : 1;
}
export function eligibleFee(charge: PolicyCharge): boolean {
  return (
    charge.active === true &&
    charge.penalty === false &&
    charge.currency?.code === 'MXN' &&
    charge.chargeAppliesTo?.id === 2 &&
    charge.chargeTimeType?.id === 2 &&
    charge.chargeCalculationType?.id === 1
  );
}
const label = [
  Validators.required,
  Validators.maxLength(100),
  Validators.pattern(/^(?=.*\S)[^\x00-\x1f\x7f-\x9f]+$/)
];
export function createPolicyForm(builder: FormBuilder) {
  return builder.group({
    classification: builder.control<Classification | null>(null, Validators.required),
    purpose: builder.control<Purpose | null>(null, Validators.required),
    withdrawalsAllowed: [true],
    depositsAllowed: [true],
    liquidGuarantee: [false],
    maximumBalance: [
      '',
      Validators.required
    ],
    minimumMonthlyAverageBalance: [
      '',
      Validators.required
    ],
    feeApplicable: [false],
    feeChargeId: builder.control<number | null>(null),
    freezing: builder.control<Freezing>('NONE', Validators.required),
    freezingTermDays: builder.control<number | null>(null),
    directDebitForLoanPayment: [false],
    multiplicity: builder.control<Multiplicity | null>(null, Validators.required),
    accountDesignation: [
      '',
      label
    ],
    additionalPaymentReference: [false],
    paymentReferencePartner: builder.control<string | null>(null),
    interestMode: builder.control<InterestMode | null>(null, Validators.required),
    interestMatrix: builder.control<InterestMatrix | null | undefined>(undefined),
    referenceRate: builder.control<ReferenceFormula | null | undefined>(undefined)
  });
}
export type PolicyForm = ReturnType<typeof createPolicyForm>;

/** Cross-resource checks use current core form values for create, authoritative core data for edit. */
export function policyValidator(
  context: () => PolicyCoreContext,
  fees: () => PolicyCharge[],
  capabilities: () => PolicyCapabilities | null
): ValidatorFn {
  return (form) => {
    const p = form.getRawValue() as ProductPolicy,
      c = context(),
      caps = capabilities();
    const errors: Record<string, string> = {};
    const fail = (field: string, key: string) => (errors[field] = 'SavingsEditor.' + key);
    for (const [
      field,
      values
    ] of [
      [
        'classification',
        caps?.classifications
      ],
      [
        'purpose',
        caps?.purposes
      ],
      [
        'freezing',
        caps?.freezingModes
      ],
      [
        'multiplicity',
        caps?.multiplicities
      ],
      [
        'interestMode',
        caps?.interestModes
      ]
    ] as [
      keyof ProductPolicy,
      string[] | undefined
    ][]) {
      if (!values?.includes(String(p[field]))) fail(field, 'UnsupportedValue');
    }
    if (!validMoney(c.opening || '0', c.digits)) fail('opening', 'OpeningInvalid');
    if (c.currency !== 'MXN') fail('currency', 'MxnRequired');
    if (!validMoney(p.maximumBalance, c.digits)) fail('maximumBalance', 'MoneyInvalid');
    if (!validMoney(p.minimumMonthlyAverageBalance, c.digits)) fail('minimumMonthlyAverageBalance', 'MoneyInvalid');
    if (
      !errors.maximumBalance &&
      validMoney(c.opening || '0', c.digits) &&
      compareMoney(p.maximumBalance, c.opening || '0') < 0
    )
      fail('maximumBalance', 'MaximumOpening');
    if (
      !errors.maximumBalance &&
      !errors.minimumMonthlyAverageBalance &&
      compareMoney(p.minimumMonthlyAverageBalance, p.maximumBalance) > 0
    )
      fail('minimumMonthlyAverageBalance', 'AverageMaximum');
    if (p.feeApplicable && !fees().some((f) => f.id === p.feeChargeId)) fail('feeChargeId', 'FeeRequired');
    if (p.classification === 'SIGHT' && p.interestMode !== 'NONE') fail('interestMode', 'SightNone');
    if (p.interestMode === 'NONE' && !/^0*(?:\.0*)?$/.test(String(c.rate))) fail('interestMode', 'ZeroRate');
    if (
      p.freezing === 'TERM' &&
      (!Number.isInteger(p.freezingTermDays) || p.freezingTermDays <= 0 || p.freezingTermDays > 2147483647)
    )
      fail('freezingTermDays', 'TermRequired');
    if (p.purpose === 'MAIN' && p.freezing !== 'NONE') fail('freezing', 'MainFreezing');
    if (p.freezing === 'LOAN_RELEASE' && p.purpose !== 'GUARANTEED') fail('freezing', 'GuaranteedFreezing');
    if (p.liquidGuarantee !== (p.purpose === 'GUARANTEED')) fail('liquidGuarantee', 'GuaranteePurpose');
    if ([
        'MAIN',
        'GUARANTEED'
      ].includes(p.purpose) && p.multiplicity !== 'SINGLE') fail('multiplicity', 'SingleRequired');
    if (p.purpose === 'POCKET' && p.multiplicity !== 'UNLIMITED') fail('multiplicity', 'UnlimitedRequired');
    if (p.additionalPaymentReference && label.some((v) => v({ value: p.paymentReferencePartner } as any)))
      fail('paymentReferencePartner', 'PartnerRequired');
    return Object.keys(errors).length ? errors : null;
  };
}

/** Clear only conditionally inapplicable fields. Never infer or alter financial choices. */
export function normalizedPolicy(form: PolicyForm): ProductPolicy {
  const value = form.getRawValue() as ProductPolicy;
  return {
    ...value,
    ...(value.interestMatrix === undefined ? {} : { interestMatrix: readMatrix(value.interestMatrix) }),
    ...(value.referenceRate === undefined ? {} : { referenceRate: readFormula(value.referenceRate) }),
    feeChargeId: value.feeApplicable ? value.feeChargeId : null,
    freezingTermDays: value.freezing === 'TERM' ? value.freezingTermDays : null,
    paymentReferencePartner: value.additionalPaymentReference ? value.paymentReferencePartner : null
  };
}
export function serializePolicy(expectedRevision: number, policy: ProductPolicy): string {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error('Invalid revision');
  for (const field of [
    'maximumBalance',
    'minimumMonthlyAverageBalance'
  ] as const) {
    if (!validMoney(policy[field], 6)) throw new Error('Invalid monetary amount');
  }
  return serializeExactJson({
    expectedRevision,
    policy: {
      ...policy,
      ...(policy.interestMatrix === undefined ? {} : { interestMatrix: readMatrix(policy.interestMatrix) }),
      ...(policy.referenceRate === undefined ? {} : { referenceRate: readFormula(policy.referenceRate) })
    }
  });
}
/** Parse decimal tokens before JSON.parse can convert them into binary floats. */
export function parsePolicyJson<T>(json: string): T {
  return parseExactJson<T>(json);
}
