/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormBuilder } from '@angular/forms';
import {
  compareMoney,
  validMoney,
  serializePolicy,
  parsePolicyJson,
  createPolicyForm,
  policyValidator,
  normalizedPolicy,
  eligibleFee,
  PolicyCapabilities,
  ProductPolicy
} from './product-policy.model';

import { capabilities, policy } from './product-policy.fixtures';

describe('policy decimals and DTO mapping', () => {
  it.each([
    '0',
    '0.00',
    '9999999999999.99',
    '0001.2000'
  ])('accepts exact money %s', (value) => expect(validMoney(value, 2)).toBe(true));
  it.each([
    '-1',
    '1e3',
    '1,000',
    'NaN',
    'Infinity',
    '.5',
    '1.001',
    '10000000000000',
    '1;null'
  ])('rejects unsupported decimal %s', (value) => expect(validMoney(value, 2)).toBe(false));
  it('compares amounts without losing significant digits', () => {
    expect(compareMoney('9999999999999.99', '9999999999999.98')).toBe(1);
    expect(compareMoney('000.00', '0')).toBe(0);
    expect(compareMoney('9.999', '10')).toBe(-1);
  });
  it('emits exact JSON numeric literals and preserves them on retrieval', () => {
    const body = serializePolicy(7, policy);
    expect(body).toContain('"maximumBalance":9999999999999.99');
    expect(body).toContain('"expectedRevision":7');
    expect(parsePolicyJson<{ policy: ProductPolicy }>(body).policy.maximumBalance).toBe('9999999999999.99');
    expect(Object.keys(JSON.parse(body).policy)).toHaveLength(19);
    expect(() => serializePolicy(-1, policy)).toThrow();
    expect(() => serializePolicy(1, { ...policy, maximumBalance: '1e10' })).toThrow();
  });
  it('clears every hidden conditional field without altering other choices', () => {
    const form = createPolicyForm(new FormBuilder());
    form.patchValue({ ...policy, feeChargeId: 99, freezingTermDays: 9, paymentReferencePartner: 'old' });
    expect(normalizedPolicy(form)).toEqual(policy);
  });
});
describe('backend aligned policy validation', () => {
  let context: { currency: string; digits: number; opening: string; rate: string };
  function validate(change: Partial<ProductPolicy> = {}) {
    const form = createPolicyForm(new FormBuilder());
    form.patchValue({ ...policy, ...change });
    form.setValidators(
      policyValidator(
        () => context,
        () => [],
        () => capabilities
      )
    );
    form.updateValueAndValidity();
    return form;
  }
  beforeEach(() => (context = { currency: 'MXN', digits: 2, opening: '0', rate: '0' }));
  it('allows zero opening and threshold, and preserves a complete policy', () => expect(validate().valid).toBe(true));
  it.each([
    [
      { classification: 'SIGHT', interestMode: 'FIXED' },
      'interestMode'
    ],
    [
      { maximumBalance: '0', minimumMonthlyAverageBalance: '1' },
      'minimumMonthlyAverageBalance'
    ],
    [
      { maximumBalance: '-1' },
      'maximumBalance'
    ],
    [
      { maximumBalance: '1.001' },
      'maximumBalance'
    ],
    [
      { feeApplicable: true, feeChargeId: 123 },
      'feeChargeId'
    ],
    [
      { freezing: 'TERM' },
      'freezingTermDays'
    ],
    [
      { freezing: 'TERM', freezingTermDays: 0 },
      'freezingTermDays'
    ],
    [
      { freezing: 'TERM', freezingTermDays: 1.5 },
      'freezingTermDays'
    ],
    [
      { freezing: 'LOAN_RELEASE' },
      'freezing'
    ],
    [
      { purpose: 'GUARANTEED' },
      'liquidGuarantee'
    ],
    [
      { liquidGuarantee: true },
      'liquidGuarantee'
    ],
    [
      { multiplicity: 'UNLIMITED' },
      'multiplicity'
    ],
    [
      { purpose: 'POCKET' },
      'multiplicity'
    ],
    [
      { additionalPaymentReference: true },
      'paymentReferencePartner'
    ]
  ] as [
    Partial<ProductPolicy>,
    string
  ][])('rejects invalid policy %j', (change, key) => expect(validate(change).errors?.[key]).toBeTruthy());
  it('validates opening versus maximum and rejects incompatible currency and nominal rate', () => {
    context.opening = '100';
    expect(validate({ maximumBalance: '99.99' }).errors?.maximumBalance).toBeTruthy();
    context.currency = 'USD';
    expect(validate().errors?.currency).toBeTruthy();
    context.rate = '1';
    expect(validate().errors?.interestMode).toBeTruthy();
  });
  it('accepts fixed interest and the supported Guaranteed/Pocket/Planned Main combinations', () => {
    context.rate = '4.5';
    expect(validate({ classification: 'INTEREST_BEARING_SIGHT', interestMode: 'FIXED' }).valid).toBe(true);
    context.rate = '0';
    expect(validate({ purpose: 'GUARANTEED', liquidGuarantee: true, freezing: 'LOAN_RELEASE' }).valid).toBe(true);
    expect(
      validate({ purpose: 'POCKET', multiplicity: 'UNLIMITED', freezing: 'TERM', freezingTermDays: 7 }).valid
    ).toBe(true);
    expect(validate({ purpose: 'PLANNED_MAIN', multiplicity: 'UNLIMITED' }).valid).toBe(true);
  });
  it('requires a nonblank bounded designation', () => {
    expect(validate({ accountDesignation: ' ' }).valid).toBe(false);
    expect(validate({ accountDesignation: '\x01' }).valid).toBe(false);
    expect(validate({ accountDesignation: 'name\x80' }).valid).toBe(false);
    expect(validate({ accountDesignation: 'x'.repeat(101) }).valid).toBe(false);
  });
  it('accepts only eligible fees', () => {
    const fee = {
      id: 1,
      name: 'fee',
      active: true,
      penalty: false,
      currency: { code: 'MXN' },
      chargeAppliesTo: { id: 2 },
      chargeTimeType: { id: 2 },
      chargeCalculationType: { id: 1 }
    };
    expect(eligibleFee(fee)).toBe(true);
    expect(eligibleFee({ ...fee, active: false })).toBe(false);
    expect(eligibleFee({ ...fee, currency: { code: 'USD' } })).toBe(false);
    expect(eligibleFee({ ...fee, penalty: true })).toBe(false);
    expect(eligibleFee({ ...fee, chargeTimeType: { id: 1 } })).toBe(false);
  });
});
