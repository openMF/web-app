/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { SavingProductCurrencyStepComponent } from './saving-product-currency-step.component';

describe('SavingProductCurrencyStepComponent', () => {
  function createComponentWithTemplate(savingProductsTemplate: any): SavingProductCurrencyStepComponent {
    TestBed.configureTestingModule({});

    const component = TestBed.runInInjectionContext(() => new SavingProductCurrencyStepComponent());
    component.savingProductsTemplate = savingProductsTemplate;
    component.ngOnInit();

    return component;
  }

  it.each([
    {
      code: 'EUR',
      decimalPlaces: 2,
      inMultiplesOf: 1
    },
    {
      code: 'BHD',
      decimalPlaces: 3,
      inMultiplesOf: 5
    }
  ])('initializes edit currency fields from nested $code currency data', (currency) => {
    const component = createComponentWithTemplate({
      id: 1,
      currency,
      currencyOptions: [
        {
          code: currency.code
        }
      ]
    });

    expect(component.savingProductCurrencyForm.value).toEqual({
      currencyCode: currency.code,
      digitsAfterDecimal: currency.decimalPlaces,
      setMultiples: true,
      inMultiplesOf: currency.inMultiplesOf
    });
    expect(component.savingProductCurrency).toEqual({
      currencyCode: currency.code,
      digitsAfterDecimal: currency.decimalPlaces,
      inMultiplesOf: currency.inMultiplesOf
    });
  });

  it('preserves zero decimal and multiples values from nested currency data', () => {
    const currency = {
      code: 'XOF',
      decimalPlaces: 0,
      inMultiplesOf: 0
    };
    const component = createComponentWithTemplate({
      id: 2,
      currency,
      currencyOptions: [
        {
          code: currency.code
        }
      ]
    });

    expect(component.savingProductCurrencyForm.value).toEqual({
      currencyCode: currency.code,
      digitsAfterDecimal: 0,
      setMultiples: false,
      inMultiplesOf: 0
    });
    expect(component.savingProductCurrency).toEqual({
      currencyCode: currency.code,
      digitsAfterDecimal: 0,
      inMultiplesOf: 0
    });
  });

  it('keeps create template decimal fields empty when no existing product id is present', () => {
    const component = createComponentWithTemplate({
      currency: {
        code: '',
        decimalPlaces: 0,
        inMultiplesOf: 0
      },
      currencyOptions: [
        {
          code: 'INR'
        }
      ]
    });

    expect(component.savingProductCurrencyForm.value).toEqual({
      currencyCode: 'INR',
      digitsAfterDecimal: '',
      setMultiples: false,
      inMultiplesOf: ''
    });
    expect(component.savingProductCurrency).toEqual({
      currencyCode: 'INR',
      digitsAfterDecimal: ''
    });
  });
});
