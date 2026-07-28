/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';

import { CurrencyConversionPayload, ExchangeRatePayload } from './exchange-rate.model';
import { ExchangeRatesService } from './exchange-rates.service';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;
  let httpMock: HttpTestingController;
  const baseServerUrl = 'http://localhost:4200/fineract-provider/api';
  const exchangeRatesResource = `${baseServerUrl}/api/v2/exchange-rates`;
  const currencyConversionResource = `${baseServerUrl}/exchange-rates`;

  const exchangeRatePayload: ExchangeRatePayload = {
    rateDate: '2026-01-15',
    buyIndicatorCode: 'BUY',
    sellIndicatorCode: 'SELL',
    buyRate: 129.25,
    sellRate: 129.65,
    referenceRate: 129.45,
    sourceCurrency: 'USD',
    targetCurrency: 'KES',
    latest: true
  };

  const conversionPayload: CurrencyConversionPayload = {
    sourceCurrencyCode: 'USD',
    targetCurrencyCode: 'KES',
    amount: 10,
    conversionDate: '15 January 2026',
    dateFormat: 'dd MMMM yyyy',
    locale: 'en'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExchangeRatesService,
        { provide: SettingsService, useValue: { baseServerUrl } },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ExchangeRatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch exchange rates with supported filters', async () => {
    const resultPromise = firstValueFrom(
      service.getExchangeRates({
        sourceCurrency: 'USD',
        targetCurrency: 'KES',
        latest: true,
        rateDate: '2026-01-15'
      })
    );

    const req = httpMock.expectOne(
      (request) => request.url === `${exchangeRatesResource}/latest` && request.method === 'GET'
    );
    expect(req.request.params.get('sourceCurrency')).toBe('USD');
    expect(req.request.params.get('targetCurrency')).toBe('KES');
    expect(req.request.params.get('latest')).toBe('true');
    expect(req.request.params.get('rateDate')).toBe('2026-01-15');
    req.flush([{ id: 1, sourceCurrency: 'USD', targetCurrency: 'KES' }]);

    expect(await resultPromise).toEqual([
      { id: 1, sourceCurrency: 'USD', sourceCurrencyCode: 'USD', targetCurrency: 'KES', targetCurrencyCode: 'KES' }
    ]);
  });

  it('should create an exchange rate', async () => {
    const resultPromise = firstValueFrom(service.createExchangeRate(exchangeRatePayload));

    const req = httpMock.expectOne((request) => request.url === exchangeRatesResource && request.method === 'POST');
    expect(req.request.body).toEqual({
      rateDate: '2026-01-15',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 129.25,
      sellRate: 129.65,
      referenceRate: 129.45,
      sourceCurrency: 'USD',
      targetCurrency: 'KES',
      latest: true
    });
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });

  it('should update an exchange rate', async () => {
    const resultPromise = firstValueFrom(service.updateExchangeRate(7, exchangeRatePayload));

    const req = httpMock.expectOne(
      (request) => request.url === `${exchangeRatesResource}/7` && request.method === 'PUT'
    );
    expect(req.request.body).toEqual({
      rateDate: '2026-01-15',
      buyIndicatorCode: 'BUY',
      sellIndicatorCode: 'SELL',
      buyRate: 129.25,
      sellRate: 129.65,
      referenceRate: 129.45,
      sourceCurrency: 'USD',
      targetCurrency: 'KES',
      latest: true
    });
    req.flush({ resourceId: 7 });

    expect(await resultPromise).toEqual({ resourceId: 7 });
  });

  it('should delete an exchange rate', async () => {
    const resultPromise = firstValueFrom(service.deleteExchangeRate(9));

    const req = httpMock.expectOne(
      (request) => request.url === `${exchangeRatesResource}/9` && request.method === 'DELETE'
    );
    req.flush({ resourceId: 9 });

    expect(await resultPromise).toEqual({ resourceId: 9 });
  });

  it('should request currency conversion', async () => {
    const resultPromise = firstValueFrom(service.convertCurrency(conversionPayload));

    const req = httpMock.expectOne(
      (request) => request.url === `${currencyConversionResource}/convert` && request.method === 'POST'
    );
    expect(req.request.body).toEqual({
      sourceCurrencyCode: 'USD',
      targetCurrencyCode: 'KES',
      amount: 10,
      conversionDate: '15 January 2026'
    });
    req.flush({
      exchangeRateUsed: 129.45,
      convertedAmount: 1294.5,
      effectiveDate: '15 January 2026',
      rateSource: 'PROVIDER',
      baseCurrency: 'USD'
    });

    expect(await resultPromise).toEqual({
      exchangeRateUsed: 129.45,
      convertedAmount: 1294.5,
      effectiveDate: '15 January 2026',
      rateSource: 'PROVIDER',
      baseCurrency: 'USD'
    });
  });
});
