/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { LoanProductService } from '../../services/loan-product.service';
import { LoanProductCurrencyStepComponent } from './loan-product-currency-step.component';

describe('LoanProductCurrencyStepComponent', () => {
  function createComponent(loanProductsTemplate: any): LoanProductCurrencyStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: LoanProductService, useValue: { isLoanProduct: true, isWorkingCapital: false } }
      ]
    });

    return TestBed.runInInjectionContext(() => {
      const component = new LoanProductCurrencyStepComponent();
      component.loanProductsTemplate = loanProductsTemplate;
      component.ngOnInit();
      return component;
    });
  }

  function editTemplate(installmentAmountInMultiplesOf: unknown): any {
    return {
      id: 3,
      currency: { code: 'USD', decimalPlaces: 2, inMultiplesOf: 0 },
      currencyOptions: [{ code: 'USD' }],
      installmentAmountInMultiplesOf
    };
  }

  it.each([
    null,
    undefined,
    0
  ])('leaves installment in multiples of empty when the product has %p', (storedValue) => {
    const component = createComponent(editTemplate(storedValue));

    expect(component.loanProductCurrency.installmentAmountInMultiplesOf).toBe('');
  });

  it('keeps the installment in multiples of value saved on the product', () => {
    const component = createComponent(editTemplate(100));

    expect(component.loanProductCurrency.installmentAmountInMultiplesOf).toBe(100);
  });

  it('starts a new product with installment in multiples of 1', () => {
    const component = createComponent({
      currencyOptions: [{ code: 'USD' }]
    });

    expect(component.loanProductCurrency.installmentAmountInMultiplesOf).toBe(1);
  });
});
