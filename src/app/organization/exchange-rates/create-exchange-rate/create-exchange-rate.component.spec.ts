/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';

import { ExchangeRatesService } from '../exchange-rates.service';
import { CreateExchangeRateComponent } from './create-exchange-rate.component';

describe('CreateExchangeRateComponent', () => {
  let router: { navigate: jest.Mock };
  let exchangeRatesService: { createExchangeRate: jest.Mock };

  function createComponent(): CreateExchangeRateComponent {
    TestBed.resetTestingModule();
    router = { navigate: jest.fn() };
    exchangeRatesService = {
      createExchangeRate: jest.fn().mockReturnValue(of({ resourceId: 1 }))
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              currencies: {
                selectedCurrencyOptions: [
                  { code: 'USD', name: 'US Dollar' },
                  { code: 'KES', name: 'Kenyan Shilling' }
                ]
              }
            })
          }
        },
        { provide: Router, useValue: router },
        { provide: ExchangeRatesService, useValue: exchangeRatesService },
        { provide: Dates, useValue: { formatDate: (date: Date) => date.toISOString().slice(0, 10) } }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CreateExchangeRateComponent());
    component.ngOnInit();
    return component;
  }

  it('marks matching source and target currencies invalid', () => {
    const component = createComponent();

    component.exchangeRateForm.patchValue({
      sourceCurrency: 'USD',
      targetCurrency: 'USD',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 1,
      sellRate: 1,
      referenceRate: 1,
      rateDate: new Date('2026-01-01')
    });

    expect(component.exchangeRateForm.hasError('sameCurrencies')).toBe(true);
  });

  it('marks zero rates invalid', () => {
    const component = createComponent();

    component.exchangeRateForm.patchValue({
      sourceCurrency: 'USD',
      targetCurrency: 'KES',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 0,
      sellRate: 0,
      referenceRate: 0,
      rateDate: new Date('2026-01-10')
    });

    expect(component.exchangeRateForm.controls.buyRate.hasError('min')).toBe(true);
    expect(component.exchangeRateForm.controls.sellRate.hasError('min')).toBe(true);
    expect(component.exchangeRateForm.controls.referenceRate.hasError('min')).toBe(true);
  });

  it('submits a formatted exchange rate payload', () => {
    const component = createComponent();

    component.exchangeRateForm.patchValue({
      sourceCurrency: 'USD',
      targetCurrency: 'KES',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 129.25,
      sellRate: 129.65,
      referenceRate: 129.45,
      rateDate: new Date('2026-01-01'),
      latest: true
    });

    component.submit();

    expect(exchangeRatesService.createExchangeRate).toHaveBeenCalledWith({
      rateDate: '2026-01-01',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 129.25,
      sellRate: 129.65,
      referenceRate: 129.45,
      sourceCurrency: 'USD',
      targetCurrency: 'KES',
      latest: true
    });
    expect(router.navigate).toHaveBeenCalledWith(['../'], expect.any(Object));
  });
});
