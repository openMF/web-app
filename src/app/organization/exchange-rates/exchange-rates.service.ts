/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SettingsService } from 'app/settings/settings.service';

import {
  CurrencyConversionPayload,
  CurrencyConversionResult,
  ExchangeRate,
  ExchangeRateFilters,
  ExchangeRatePayload
} from './exchange-rate.model';
import { getCurrencyCode } from './exchange-rate-form.util';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRatesService {
  private http = inject(HttpClient);
  private settingsService = inject(SettingsService);

  private get exchangeRatesResource(): string {
    return `${this.settingsService.baseServerUrl}/api/v2/exchange-rates`;
  }

  private get currencyConversionResource(): string {
    return `${this.settingsService.baseServerUrl}/exchange-rates`;
  }

  getExchangeRates(filters: ExchangeRateFilters = {}): Observable<ExchangeRate[] | { pageItems?: ExchangeRate[] }> {
    let httpParams = this.addParam(new HttpParams(), 'sourceCurrency', filters.sourceCurrency);
    httpParams = this.addParam(httpParams, 'targetCurrency', filters.targetCurrency);
    httpParams = this.addParam(httpParams, 'latest', filters.latest);
    httpParams = this.addParam(httpParams, 'rateDate', filters.rateDate);

    return this.http
      .get<ExchangeRate[]>(`${this.exchangeRatesResource}/latest`, { params: httpParams })
      .pipe(map((rates) => rates.map((rate) => this.normalizeExchangeRate(rate))));
  }

  getExchangeRate(exchangeRateId: string): Observable<ExchangeRate> {
    return this.http
      .get<ExchangeRate>(`${this.exchangeRatesResource}/${exchangeRateId}`)
      .pipe(map((rate) => this.normalizeExchangeRate(rate)));
  }

  createExchangeRate(exchangeRate: ExchangeRatePayload): Observable<{ resourceId: number }> {
    return this.http.post<{ resourceId: number }>(this.exchangeRatesResource, this.toExchangeRateRequest(exchangeRate));
  }

  updateExchangeRate(
    exchangeRateId: string | number,
    exchangeRate: ExchangeRatePayload
  ): Observable<{ resourceId: number }> {
    return this.http.put<{ resourceId: number }>(
      `${this.exchangeRatesResource}/${exchangeRateId}`,
      this.toExchangeRateRequest(exchangeRate)
    );
  }

  deleteExchangeRate(exchangeRateId: string | number): Observable<{ resourceId: number }> {
    return this.http.delete<{ resourceId: number }>(`${this.exchangeRatesResource}/${exchangeRateId}`);
  }

  convertCurrency(conversion: CurrencyConversionPayload): Observable<CurrencyConversionResult> {
    return this.http
      .post<CurrencyConversionResult>(`${this.currencyConversionResource}/convert`, {
        sourceCurrencyCode: conversion.sourceCurrencyCode,
        targetCurrencyCode: conversion.targetCurrencyCode,
        amount: conversion.amount,
        conversionDate: conversion.conversionDate
      })
      .pipe(
        map((result) => ({
          ...result,
          sourceCurrencyCode: result.sourceCurrencyCode ?? result.sourceCurrency,
          targetCurrencyCode: result.targetCurrencyCode ?? result.targetCurrency,
          amount: result.amount ?? result.sourceAmount,
          exchangeRateUsed: result.exchangeRateUsed ?? result.exchangeRate
        }))
      );
  }

  private addParam(httpParams: HttpParams, key: string, value: string | boolean | undefined | null): HttpParams {
    return value !== undefined && value !== null && value !== '' ? httpParams.set(key, value.toString()) : httpParams;
  }

  private toExchangeRateRequest(exchangeRate: ExchangeRatePayload) {
    return {
      rateDate: exchangeRate.rateDate,
      buyIndicatorCode: exchangeRate.buyIndicatorCode,
      sellIndicatorCode: exchangeRate.sellIndicatorCode,
      buyRate: exchangeRate.buyRate,
      sellRate: exchangeRate.sellRate,
      referenceRate: exchangeRate.referenceRate,
      sourceCurrency: exchangeRate.sourceCurrency,
      targetCurrency: exchangeRate.targetCurrency,
      latest: exchangeRate.latest
    };
  }

  private normalizeExchangeRate(exchangeRate: ExchangeRate): ExchangeRate {
    return {
      ...exchangeRate,
      sourceCurrencyCode: exchangeRate.sourceCurrencyCode ?? getCurrencyCode(exchangeRate.sourceCurrency),
      targetCurrencyCode: exchangeRate.targetCurrencyCode ?? getCurrencyCode(exchangeRate.targetCurrency)
    };
  }
}
