/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

import { ExchangeRatesService } from '../exchange-rates.service';
import { CurrencyConversionComponent } from './currency-conversion.component';

describe('CurrencyConversionComponent', () => {
  let exchangeRatesService: { convertCurrency: jest.Mock };

  function createComponent(convertCurrencyMock?: jest.Mock): CurrencyConversionComponent {
    TestBed.resetTestingModule();
    exchangeRatesService = {
      convertCurrency:
        convertCurrencyMock ||
        jest.fn().mockReturnValue(
          of({
            exchangeRateUsed: 129.45,
            convertedAmount: 1294.5,
            effectiveDate: '2026-01-15',
            rateSource: 'PROVIDER'
          })
        )
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
        { provide: ExchangeRatesService, useValue: exchangeRatesService },
        { provide: SettingsService, useValue: { dateFormat: 'yyyy-MM-dd', language: { code: 'en' } } },
        { provide: Dates, useValue: { formatDate: (date: Date) => date.toISOString().slice(0, 10) } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string, params?: { currency: string }) =>
              key === 'labels.inputs.Cross Rate via' ? `Cross Rate (via ${params?.currency})` : key.split('.').pop()
          }
        }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new CurrencyConversionComponent());
    component.ngOnInit();
    return component;
  }

  it('marks matching source and target currencies invalid', () => {
    const component = createComponent();

    component.conversionForm.patchValue({
      sourceCurrencyCode: 'USD',
      targetCurrencyCode: 'USD',
      amount: 10,
      conversionDate: new Date('2026-01-15')
    });

    expect(component.conversionForm.hasError('sameCurrencies')).toBe(true);
  });

  it('submits a formatted conversion payload and stores the result', () => {
    const component = createComponent();

    component.conversionForm.patchValue({
      sourceCurrencyCode: 'USD',
      targetCurrencyCode: 'KES',
      amount: 10,
      conversionDate: new Date('2026-01-15')
    });

    component.submit();

    expect(exchangeRatesService.convertCurrency).toHaveBeenCalledWith({
      sourceCurrencyCode: 'USD',
      targetCurrencyCode: 'KES',
      amount: 10,
      conversionDate: '2026-01-15',
      dateFormat: 'yyyy-MM-dd',
      locale: 'en'
    });
    expect(component.exchangeRateUsed).toBe(129.45);
    expect(component.conversionResult.convertedAmount).toBe(1294.5);
    expect(component.rateSourceDisplay).toBe('Provider');
  });

  it('displays cross-rate metadata with the backend base currency', () => {
    const component = createComponent(
      jest.fn().mockReturnValue(
        of({
          exchangeRateUsed: 0.0022,
          convertedAmount: 22,
          effectiveDate: '2026-01-15',
          rateSource: 'CROSS_RATE',
          baseCurrency: 'USD'
        })
      )
    );

    component.conversionForm.patchValue({
      sourceCurrencyCode: 'CRC',
      targetCurrencyCode: 'KES',
      amount: 10000,
      conversionDate: new Date('2026-01-15')
    });
    component.submit();

    expect(component.rateSourceDisplay).toBe('Cross Rate (via USD)');
    expect(component.conversionResult.baseCurrency).toBe('USD');
  });

  it('keeps the backend validation message on conversion errors', () => {
    const component = createComponent(
      jest
        .fn()
        .mockReturnValue(throwError(() => ({ error: { errors: [{ defaultUserMessage: 'No exchange rate found.' }] } })))
    );

    component.conversionForm.patchValue({
      sourceCurrencyCode: 'USD',
      targetCurrencyCode: 'KES',
      amount: 10,
      conversionDate: new Date('2026-01-15')
    });
    component.submit();

    expect(component.apiError).toBe('No exchange rate found.');
    expect(component.loading).toBe(false);
  });
});
