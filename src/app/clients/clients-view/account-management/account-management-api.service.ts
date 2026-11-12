/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { parseExactJson } from 'app/products/saving-products/product-editor/interest-rate.model';
import { ACCOUNT_MANAGEMENT_REQUEST } from 'app/core/http/account-management-request';
import { positiveId } from './account-management.state';

const moneyFields = [
  'accountBalance',
  'totalInterestPosted',
  'totalInterestEarned',
  'nominalAnnualInterestRate',
  'nativeWithdrawableBalance',
  'availableGuaranteeFunds',
  'requestedAmount',
  'loanOutstanding',
  'appliedAmount',
  'proposedAmount',
  'reservedAmount',
  'consumedAmount',
  'releasedAmount',
  'contributionAmount',
  'expectedAmount',
  'balance',
  'withdrawableBalance',
  'nativeInterestEarned',
  'nativeInterestPosted'
];

@Injectable({ providedIn: 'root' })
export class AccountManagementApi {
  private readonly http = inject(HttpClient);
  get<T>(url: string, parameters: Record<string, string | number> = {}): Observable<T> {
    // Shared safe error rendering is narrowly scoped in ErrorHandlerInterceptor; auth stays intercepted.
    return this.http
      .get(url, {
        responseType: 'text',
        context: new HttpContext().set(ACCOUNT_MANAGEMENT_REQUEST, true),
        params: new HttpParams({ fromObject: parameters })
      })
      .pipe(map((text) => parseExactJson<T>(text, moneyFields)));
  }
  put<T>(url: string, body: object | string): Observable<T> {
    return this.http
      .put(url, body, {
        responseType: 'text',
        context: new HttpContext().set(ACCOUNT_MANAGEMENT_REQUEST, true),
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })
      .pipe(map((text) => parseExactJson<T>(text, moneyFields)));
  }
  client(root: string, clientId: number): string {
    if (!positiveId(clientId)) throw new Error('Invalid client identifier');
    return root + '/clients/' + clientId;
  }
  owned<T extends { clientId: number }>(value: T, clientId: number): T {
    if (!value || value.clientId !== clientId) throw new Error('Invalid account owner');
    return value;
  }
}
