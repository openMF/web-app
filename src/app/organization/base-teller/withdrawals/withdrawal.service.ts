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
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';
import {
  PendingWithdrawal,
  WithdrawalAccount,
  WithdrawalContext,
  WithdrawalCustomer,
  WithdrawalOption,
  WithdrawalRecord,
  WithdrawalRequest,
  validWithdrawalAmount
} from './withdrawal.models';

/** The backend requires a numeric JSON amount. Preserve the validated decimal token exactly. */
export function withdrawalJson(request: WithdrawalRequest): string {
  if (!validWithdrawalAmount(request.amount, 6)) throw new Error('Invalid amount');
  return JSON.stringify(request).replace(/"amount":"([0-9.]+)"/, '"amount":$1');
}
@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthenticationService);
  private readonly settings = inject(SettingsService);
  private readonly path = '/v2/base-teller/withdrawals';
  private get storageKey() {
    return (
      'mifosWithdrawal:' +
      JSON.stringify([
        this.settings.baseServerUrl,
        this.settings.tenantIdentifier,
        this.auth.getCredentials()?.userId
      ])
    );
  }
  get pending(): PendingWithdrawal | null {
    const value = sessionStorage.getItem(this.storageKey);
    return value ? JSON.parse(value) : null;
  }
  async remember(request: WithdrawalRequest): Promise<void> {
    const { identificationReference, ...safe } = request;
    const identityDigest = await this.digest(identificationReference, safe.idempotencyKey ?? '');
    sessionStorage.setItem(this.storageKey, JSON.stringify({ request: safe, identityDigest }));
  }
  async recover(reference: string): Promise<WithdrawalRequest | null> {
    const pending = this.pending;
    return pending && (await this.digest(reference, pending.request.idempotencyKey ?? '')) === pending.identityDigest
      ? { ...pending.request, identificationReference: reference }
      : null;
  }
  private async digest(reference: string, salt: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + reference));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  clearPending() {
    sessionStorage.removeItem(this.storageKey);
  }
  context() {
    return this.get<WithdrawalContext>('/context');
  }
  customers(field: 'name' | 'clientNumber', value: string, offset: number, limit: number) {
    return this.http
      .get(`${this.path}/customers`, { params: { [field]: value, offset, limit }, responseType: 'text' })
      .pipe(map(parseExchangeResponse<{ pageItems: WithdrawalCustomer[]; totalFilteredRecords: number }>));
  }
  accounts(clientId: number) {
    return this.get<WithdrawalAccount[]>(`/customers/${clientId}/accounts`);
  }
  account(accountId: number) {
    return this.get<WithdrawalAccount>(`/accounts/${accountId}`);
  }
  banks() {
    return this.get<WithdrawalOption[]>('/banks');
  }
  checkTypes() {
    return this.get<WithdrawalOption[]>('/check-types');
  }
  preview(request: WithdrawalRequest) {
    return this.post('/preview', request);
  }
  create(request: WithdrawalRequest) {
    return this.post('', request).pipe(timeout(30000));
  }
  retrieve(id: number) {
    return this.get<WithdrawalRecord>(`/${id}`);
  }
  receipt(id: number) {
    return this.get<WithdrawalRecord>(`/${id}/receipt`);
  }
  private get<T>(suffix: string) {
    return this.http.get(this.path + suffix, { responseType: 'text' }).pipe(map(parseExchangeResponse<T>));
  }
  private post(suffix: string, request: WithdrawalRequest) {
    return this.http
      .post(this.path + suffix, withdrawalJson(request), {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text'
      })
      .pipe(map(parseExchangeResponse<WithdrawalRecord>));
  }
}
