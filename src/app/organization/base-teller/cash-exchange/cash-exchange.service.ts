/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
  ExchangeContext,
  ExchangeInventory,
  ExchangePreview,
  ExchangeRecord,
  ExchangeRequest
} from './cash-exchange.models';

/** Preserve decimal JSON tokens before JSON.parse can round monetary values. Quoted strings are left intact. */
export function parseExchangeResponse<T>(text: string): T {
  return JSON.parse(
    text.replace(
      /("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (token, quoted) =>
        quoted || (/[.eE]/.test(token) || !Number.isSafeInteger(Number(token)) ? JSON.stringify(token) : token)
    )
  ) as T;
}

@Injectable({ providedIn: 'root' })
export class CashExchangeService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/cash-exchanges';
  context() {
    return this.http.get<ExchangeContext>(`${this.path}/context`);
  }
  denominations(cashierId: number, currencyCode: string) {
    return this.http
      .get(`${this.path}/denominations`, { params: { cashierId, currencyCode }, responseType: 'text' })
      .pipe(map(parseExchangeResponse<ExchangeInventory>));
  }
  preview(request: ExchangeRequest) {
    return this.http
      .post(`${this.path}/preview`, request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ExchangePreview>));
  }
  create(request: ExchangeRequest) {
    return this.http
      .post(this.path, request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ExchangeRecord>));
  }
  retrieve(id: number) {
    return this.http
      .get(`${this.path}/${id}`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ExchangeRecord>));
  }
  receipt(id: number) {
    return this.http
      .get(`${this.path}/${id}/receipt`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<ExchangeRecord>));
  }
}
