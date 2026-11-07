/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inactivePricingFields, resolvePaymentAmountCalculationStrategy } from './working-capital-loan-account.model';

describe('resolvePaymentAmountCalculationStrategy', () => {
  it('reads the enum name from the option object the API returns', () => {
    expect(resolvePaymentAmountCalculationStrategy({ id: 'ANNUAL_EIR', code: 'ANNUAL_EIR', value: 'Annual EIR' })).toBe(
      'ANNUAL_EIR'
    );
  });

  it('reads the plain enum name a form holds', () => {
    expect(resolvePaymentAmountCalculationStrategy('payment_amount')).toBe('PAYMENT_AMOUNT');
  });

  it('falls back to TPV, the backend default, for missing or unknown values', () => {
    expect(resolvePaymentAmountCalculationStrategy(null)).toBe('TPV');
    expect(resolvePaymentAmountCalculationStrategy(undefined)).toBe('TPV');
    expect(resolvePaymentAmountCalculationStrategy('FLAT')).toBe('TPV');
    expect(resolvePaymentAmountCalculationStrategy({ id: '', code: '', value: '' })).toBe('TPV');
  });
});

describe('inactivePricingFields', () => {
  it('lists every pricing input that does not belong to the strategy', () => {
    expect(inactivePricingFields('ANNUAL_EIR').sort()).toEqual(
      [
        'maxPaymentAmount',
        'maxPeriodPaymentRate',
        'minPaymentAmount',
        'minPeriodPaymentRate',
        'paymentAmount',
        'periodPaymentRate',
        'totalPaymentVolume'
      ].sort()
    );
    expect(inactivePricingFields('TPV')).not.toContain('periodPaymentRate');
    expect(inactivePricingFields('TPV')).toContain('annualEir');
  });
});
