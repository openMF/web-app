/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import {
  VaultDepositAudit,
  VaultDepositDetail,
  VaultDepositHistoryFilter,
  VaultDepositHistoryResponse
} from './vault-deposit-history.models';

@Injectable({ providedIn: 'root' })
export class VaultDepositHistoryService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/vault-cash-deposits';

  search(filters: VaultDepositHistoryFilter = {}): Observable<VaultDepositHistoryResponse> {
    let params = new HttpParams();
    // Explicit allowlist: no arbitrary sorting or other teller transaction types.
    for (const key of [
      'officeId',
      'vaultKey',
      'currencyCode',
      'status',
      'fromDate',
      'toDate',
      'reference',
      'offset',
      'limit'
    ] as const) {
      const value = filters[key];
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    }
    return this.http
      .get(`${this.path}/history`, { params, responseType: 'text' })
      .pipe(map(parseExchangeResponse<VaultDepositHistoryResponse>));
  }

  getDetail(reference: string): Observable<VaultDepositDetail> {
    return this.http
      .get(`${this.path}/${encodeURIComponent(reference)}`, { responseType: 'text' })
      .pipe(map(parseExchangeResponse<VaultDepositDetail>));
  }

  getAudit(reference: string): Observable<VaultDepositAudit> {
    return this.http.get<VaultDepositAudit>(`${this.path}/${encodeURIComponent(reference)}/audit`);
  }

  /** Current API only returns a structured 409 NOT_POSTED. No successful receipt DTO exists. */
  checkReceiptAvailability(reference: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.path}/${encodeURIComponent(reference)}/receipt`);
  }
}

export function vaultHistoryErrorKey(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'vaultDeposit.history.errors.unavailable';
  if (error.status === 401) return 'vaultDeposit.errors.unauthenticated';
  if (error.status === 403) return 'vaultDeposit.errors.forbidden';
  if (error.status === 404) return 'vaultDeposit.history.errors.notFound';
  if (error.status === 400 || error.status === 422) return 'vaultDeposit.history.errors.filters';
  try {
    const body = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
    if (
      error.status === 409 &&
      body?.userMessageGlobalisationCode === 'error.msg.base.teller.vault.receipt.not_posted'
    ) {
      return 'vaultDeposit.history.receiptNotPosted';
    }
  } catch {
    /* Keep unstructured diagnostics out of the UI. */
  }
  return 'vaultDeposit.history.errors.unavailable';
}
