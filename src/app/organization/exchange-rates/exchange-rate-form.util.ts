/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Currency } from 'app/shared/models/general.model';

import { ExchangeRate } from './exchange-rate.model';

export function getCurrencyCode(currency: Currency | string | undefined): string {
  if (!currency) {
    return '';
  }
  return typeof currency === 'string' ? currency : currency.code;
}

export function resolveSourceCurrencyCode(exchangeRate: ExchangeRate): string {
  return exchangeRate.sourceCurrencyCode || getCurrencyCode(exchangeRate.sourceCurrency);
}

export function resolveTargetCurrencyCode(exchangeRate: ExchangeRate): string {
  return exchangeRate.targetCurrencyCode || getCurrencyCode(exchangeRate.targetCurrency);
}

export function resolveCurrencyOptions(currencies?: {
  currencyOptions?: Currency[];
  selectedCurrencyOptions?: Currency[];
}): Currency[] {
  return currencies?.currencyOptions?.length ? currencies.currencyOptions : currencies?.selectedCurrencyOptions || [];
}
