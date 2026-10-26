/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Currency } from 'app/shared/models/general.model';

export interface ExchangeRate {
  id?: number;
  sourceCurrencyCode?: string;
  targetCurrencyCode?: string;
  sourceCurrency?: Currency | string;
  targetCurrency?: Currency | string;
  rateDate?: string | number[];
  buyIndicatorCode?: string;
  sellIndicatorCode?: string;
  buyRate?: number;
  sellRate?: number;
  referenceRate?: number;
  latest?: boolean;
}

export interface ExchangeRateFilters {
  sourceCurrency?: string;
  targetCurrency?: string;
  latest?: boolean | string;
  rateDate?: string;
  dateFormat?: string;
  locale?: string;
}

export interface ExchangeRatePayload {
  rateDate: string;
  buyIndicatorCode: string;
  sellIndicatorCode: string;
  buyRate: number;
  sellRate: number;
  referenceRate: number;
  sourceCurrency: string;
  targetCurrency: string;
  latest: boolean;
}

export interface CurrencyConversionPayload {
  sourceCurrencyCode: string;
  targetCurrencyCode: string;
  amount: number;
  conversionDate: string;
  dateFormat: string;
  locale: string;
}

export interface CurrencyConversionResult {
  sourceCurrencyCode?: string;
  targetCurrencyCode?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  amount?: number;
  sourceAmount?: number;
  exchangeRate?: number;
  exchangeRateUsed?: number;
  convertedAmount?: number;
  effectiveDate?: string | number[];
  effectiveFromDate?: string | number[];
  rateSource?: string;
  baseCurrency?: string;
}
