/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, timeout } from 'rxjs';
import { parseExchangeResponse } from '../base-teller/cash-exchange/cash-exchange.service';
import {
  FxAudit,
  FxCustomerPage,
  FxDenomination,
  FxDraft,
  FxOperation,
  FxRateContext,
  FxRatePreview,
  FxRateRequest,
  FxTellerContext,
  FxTradePreview,
  FxTradeRequest,
  fxJson
} from './foreign-currency.models';

@Injectable({ providedIn: 'root' })
export class ForeignCurrencyService {
  private readonly http = inject(HttpClient);
  private readonly rates = '/v2/foreign-currency/rates';
  private readonly teller = '/v2/base-teller/foreign-currency';
  getAdminContext() {
    return this.get<FxRateContext>(this.rates + '/context');
  }
  getRateDrafts(officeId: number, effectiveDate: string, offset = 0) {
    return this.get<FxDraft[]>(this.rates, { officeId, effectiveDate, offset, limit: 100 });
  }
  getRateDraft(id: number) {
    return this.get<FxDraft>(this.rates + '/' + id);
  }
  getRateAudit(id: number) {
    return this.get<FxAudit[]>(this.rates + '/' + id + '/audit');
  }
  previewRateDraft(request: FxRateRequest) {
    return this.post<FxRatePreview>(this.rates + '/preview', request);
  }
  createRateDraft(request: FxRateRequest) {
    return this.post<FxDraft[]>(this.rates, request);
  }
  getTellerContext() {
    return this.get<FxTellerContext>(this.teller + '/context');
  }
  searchCustomers(field: 'name' | 'clientNumber', value: string, offset = 0) {
    return this.get<FxCustomerPage>(this.teller + '/customers', { [field]: value, offset, limit: 25 });
  }
  getDenominations(currencyCode: string) {
    return this.get<FxDenomination[]>(this.teller + '/denominations', { currencyCode });
  }
  preview(operation: FxOperation, request: FxTradeRequest) {
    return this.post<FxTradePreview>(
      this.teller + (operation === 'PURCHASE' ? '/purchases/preview' : '/sales/preview'),
      request
    );
  }
  // Publication and execution deliberately have no service methods.
  private get<T>(path: string, params: Record<string, string | number> = {}) {
    return this.http.get(path, { params, responseType: 'text' }).pipe(timeout(30000), map(parseExchangeResponse<T>));
  }
  private post<T>(path: string, body: FxRateRequest | FxTradeRequest) {
    return this.http
      .post(path, fxJson(body), { headers: { 'Content-Type': 'application/json' }, responseType: 'text' })
      .pipe(timeout(30000), map(parseExchangeResponse<T>));
  }
}
