/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
  ClientPage,
  TransferAccount,
  TransferContext,
  TransferOperation,
  TransferPreview,
  TransferReceipt,
  TransferRequest
} from './account-transfer.models';

/** Preserve money tokens before JSON.parse can round them. IDs remain numbers. */
export function parseTransferResponse<T>(text: string): T {
  return JSON.parse(
    text.replace(
      /("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (token, quoted) =>
        quoted || (/[.eE]/.test(token) || !Number.isSafeInteger(Number(token)) ? JSON.stringify(token) : token)
    )
  ) as T;
}
/** Money is validated as decimal text and emitted as a JSON number without Number conversion. */
export function transferJson(r: TransferRequest): string {
  if (!/^(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(r.amount) || !/[1-9]/.test(r.amount))
    throw new Error('Invalid decimal amount');
  const { amount, ...identifiers } = r;
  return JSON.stringify(identifiers).slice(0, -1) + ',"amount":' + amount + '}';
}
@Injectable({ providedIn: 'root' })
export class AccountTransferService {
  private readonly http = inject(HttpClient);
  private readonly root = '/v2/base-teller/account-transfers';
  private read<T>(path: string, params: Record<string, string | number> = {}) {
    return this.http.get(this.root + path, { params, responseType: 'text' }).pipe(map(parseTransferResponse<T>));
  }
  context() {
    return this.read<TransferContext>('/context');
  }
  clients(method: 'clientNumber' | 'name', value: string, offset = 0, limit = 10) {
    return this.read<ClientPage>('/clients', { [method]: value.trim(), offset, limit });
  }
  accounts(clientId: number) {
    return this.read<TransferAccount[]>(`/clients/${clientId}/accounts`);
  }
  sources(clientId: number) {
    return this.read<TransferAccount[]>(`/clients/${clientId}/source-accounts`);
  }
  destinations(
    clientId: number,
    sourceAccountId: number,
    operationType: TransferOperation,
    beneficiaryClientId?: number
  ) {
    return this.read<TransferAccount[]>(`/clients/${clientId}/destination-accounts`, {
      sourceAccountId,
      operationType,
      ...(beneficiaryClientId ? { beneficiaryClientId } : {})
    });
  }
  lookup(accountNumber: string, orderingClientId: number, sourceAccountId: number, operationType: TransferOperation) {
    return this.read<TransferAccount>('/accounts/lookup', {
      accountNumber: accountNumber.trim(),
      orderingClientId,
      sourceAccountId,
      operationType
    });
  }
  private post<T>(path: string, request: TransferRequest) {
    return this.http
      .post(this.root + path, transferJson(request), {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'text'
      })
      .pipe(map(parseTransferResponse<T>));
  }
  preview(request: TransferRequest) {
    return this.post<TransferPreview>('/preview', request);
  }
  create(request: TransferRequest) {
    return this.post<TransferReceipt>('', request);
  }
  retrieve(id: number) {
    return this.read<TransferReceipt>(`/${id}`);
  }
  receipt(id: number) {
    return this.read<TransferReceipt>(`/${id}/receipt`);
  }
}
