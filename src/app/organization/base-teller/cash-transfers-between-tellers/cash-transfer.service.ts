/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { map } from 'rxjs';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import {
  CashTransferContext,
  CashTransferRecord,
  CashTransferRequest,
  PendingCashTransfer
} from './cash-transfer.models';
@Injectable({ providedIn: 'root' })
export class CashTransferService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthenticationService);
  private readonly path = '/v2/base-teller/cash-transfers';
  // Per-tab recovery survives reload. No credentials are stored; scope by backend, tenant and actor.
  private get storageKey(): string {
    return (
      'mifosCashTransfer:' +
      JSON.stringify([
        localStorage.getItem('mifosXServerURL') ?? environment.baseApiUrl,
        localStorage.getItem('mifosXTenantIdentifier') ?? environment.fineractPlatformTenantId,
        this.auth.getCredentials()?.userId
      ])
    );
  }
  get pending(): PendingCashTransfer | undefined {
    const saved = sessionStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : undefined;
  }
  remember(pending: PendingCashTransfer): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(pending));
  }
  clearPending(): void {
    sessionStorage.removeItem(this.storageKey);
  }
  context() {
    return this.http
      .get(`${this.path}/context`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<CashTransferContext>));
  }
  preview(request: CashTransferRequest) {
    return this.http
      .post(`${this.path}/preview`, request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<CashTransferRecord>));
  }
  create(request: CashTransferRequest) {
    return this.http
      .post(this.path, request, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<CashTransferRecord>));
  }
  retrieve(id: number) {
    return this.http
      .get(`${this.path}/${id}`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<CashTransferRecord>));
  }
  receipt(id: number) {
    return this.http
      .get(`${this.path}/${id}/receipt`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<CashTransferRecord>));
  }
}
