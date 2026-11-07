/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import {
  VaultContext,
  VaultCurrencies,
  VaultDenominations,
  VaultInventory,
  VaultDepositPreview,
  VaultDepositPreviewRequest
} from './vault-cash-deposit.models';

@Injectable({ providedIn: 'root' })
export class VaultCashDepositService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/vault';

  // Omit officeId: the server resolves the authenticated office and checks custody scope on every read.
  getVaultContext(): Observable<VaultContext> {
    return this.http.get<VaultContext>(`${this.path}/context`);
  }

  getSupportedCurrencies(): Observable<VaultCurrencies> {
    return this.http.get<VaultCurrencies>(`${this.path}/currencies`);
  }

  getDenominations(currencyCode: string): Observable<VaultDenominations> {
    return this.http
      .get(`${this.path}/denominations`, {
        params: new HttpParams().set('currencyCode', currencyCode),
        responseType: 'text'
      })
      .pipe(map(parseExchangeResponse<VaultDenominations>));
  }

  getVaultInventory(currencyCode: string): Observable<VaultInventory> {
    return this.http.get<VaultInventory>(`${this.path}/inventory`, {
      params: new HttpParams().set('currencyCode', currencyCode)
    });
  }

  previewVaultCashDeposit(request: VaultDepositPreviewRequest): Observable<VaultDepositPreview> {
    return this.http
      .post('/v2/base-teller/vault-cash-deposits/preview', request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<VaultDepositPreview>));
  }
}
