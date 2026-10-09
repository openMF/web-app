/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CurrencyConversionPayload,
  CurrencyConversionResult,
  ExchangeRate,
  ExchangeRateFilters,
  ExchangeRatePayload
} from './exchange-rate.model';
import { getCurrencyCode } from './exchange-rate-form.util';

type ExchangeRateResponse = ExchangeRate[] | ExchangeRate | { pageItems?: ExchangeRate[]; error?: string };
type ExchangeRateResponseObject = ExchangeRate & { pageItems?: ExchangeRate[]; error?: string };

@Injectable({
  providedIn: 'root'
})
export class ExchangeRatesService {
  private http = inject(HttpClient);

  private readonly exchangeRatesResource = '/v2/exchange-rates';
  private readonly currencyConversionResource = '/exchange-rates';

  getExchangeRates(filters: ExchangeRateFilters = {}): Observable<ExchangeRate[] | { pageItems?: ExchangeRate[] }> {
    let httpParams = this.addParam(new HttpParams(), 'sourceCurrency', filters.sourceCurrency);
    httpParams = this.addParam(httpParams, 'targetCurrency', filters.targetCurrency);
    httpParams = this.addParam(httpParams, 'latest', filters.latest);
    httpParams = this.addParam(httpParams, 'rateDate', filters.rateDate);

    return this.httpWithoutDefaultErrorHandler()
      .get<ExchangeRateResponse>(`${this.exchangeRatesResource}/latest`, { params: httpParams })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of([]);
          }
          return throwError(() => error);
        }),
        map((rates) => this.normalizeExchangeRateResponse(rates).map((rate) => this.normalizeExchangeRate(rate)))
      );
  }

  getExchangeRate(exchangeRateId: string): Observable<ExchangeRate> {
    return this.getExchangeRates().pipe(
      map((rates) => {
        const exchangeRate = this.normalizeExchangeRateResponse(rates).find(
          (rate) => rate.id?.toString() === exchangeRateId.toString()
        );
        if (!exchangeRate) {
          throw new Error(`Exchange rate not found with id: ${exchangeRateId}`);
        }
        return exchangeRate;
      })
    );
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

  private httpWithoutDefaultErrorHandler(): HttpClient {
    const configurableHttp = this.http as HttpClient & { skipErrorHandler?: () => HttpClient };
    return configurableHttp.skipErrorHandler ? configurableHttp.skipErrorHandler() : this.http;
  }

  private normalizeExchangeRateResponse(response: ExchangeRateResponse): ExchangeRate[] {
    if (Array.isArray(response)) {
      return response;
    }
    const responseObject = response as ExchangeRateResponseObject;
    if (Array.isArray(responseObject?.pageItems)) {
      return responseObject.pageItems;
    }
    if (this.isExchangeRate(responseObject)) {
      return [
        responseObject
      ];
    }
    return [];
  }

  private isExchangeRate(response: ExchangeRateResponseObject | null | undefined): response is ExchangeRate {
    return !!(
      response &&
      !response.error &&
      (response.id ||
        response.sourceCurrency ||
        response.targetCurrency ||
        response.sourceCurrencyCode ||
        response.targetCurrencyCode)
    );
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
