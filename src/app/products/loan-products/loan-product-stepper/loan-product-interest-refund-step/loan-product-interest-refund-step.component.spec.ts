/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { StringEnumOptionData } from '../../../../shared/models/option-data.model';
import { LoanProductInterestRefundStepComponent } from './loan-product-interest-refund-step.component';

describe('LoanProductInterestRefundStepComponent', () => {
  const refundOptions = [
    { id: 'MERCHANT_ISSUED_REFUND', code: 'MERCHANT_ISSUED_REFUND', value: 'Merchant issued refund' },
    { id: 'PAYOUT_REFUND', code: 'PAYOUT_REFUND', value: 'Payout refund' }
  ] as StringEnumOptionData[];

  function lastEmitted(
    loanProductsTemplate: any,
    channel: 'supportedInterestRefundTypes' | 'supportedFeeRefundTypes' = 'supportedInterestRefundTypes'
  ): StringEnumOptionData[] {
    TestBed.resetTestingModule();
    const emitted: StringEnumOptionData[][] = [];
    TestBed.runInInjectionContext(() => {
      const component = new LoanProductInterestRefundStepComponent();
      component[channel].subscribe((value) => emitted.push(value));
      component.loanProductsTemplate = loanProductsTemplate;
      component.ngOnInit();
    });
    return emitted.at(-1);
  }

  it('emits an empty list for a new product, whose template only has the options', () => {
    expect(lastEmitted({ supportedInterestRefundTypesOptions: refundOptions })).toEqual([]);
  });

  it('emits the interest refund types saved on the product', () => {
    const emitted = lastEmitted({
      supportedInterestRefundTypesOptions: refundOptions,
      supportedInterestRefundTypes: [refundOptions[1]]
    });

    expect(emitted).toEqual([refundOptions[1]]);
  });

  it('emits an empty fee refund list for a new product', () => {
    expect(lastEmitted({ supportedFeeRefundTypesOptions: refundOptions }, 'supportedFeeRefundTypes')).toEqual([]);
  });

  it('emits the fee refund types saved on the product', () => {
    expect(
      lastEmitted(
        {
          supportedFeeRefundTypesOptions: refundOptions,
          supportedFeeRefundTypes: [refundOptions[0]]
        },
        'supportedFeeRefundTypes'
      )
    ).toEqual([refundOptions[0]]);
  });
});
