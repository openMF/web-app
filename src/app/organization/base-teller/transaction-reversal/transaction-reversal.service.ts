/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReversalDenomination {
  id: string;
  value: number;
  type: string;
  currencyCode: string;
}

export interface ReversalCheck {
  id: number;
  bankId: number;
  bank: string;
  checkNumber: string;
  amount: number;
  currencyCode: string;
  eligible: boolean;
}

export interface ReversalQuantity {
  denominationId: string;
  quantity: number;
}

export interface ReversalLine extends ReversalQuantity {
  value: number;
}

export interface ReversalContext {
  businessDate: string;
  cashiers: { id: number; name: string }[];
  currencies: { code: string; name: string; decimalPlaces: number }[];
  banks: { id: number; code: string; name: string }[];
  denominations: ReversalDenomination[];
  canCreate: boolean;
  canAuthorize: boolean;
}

export interface ReversalCandidate {
  original: {
    historyId: string;
    transactionDate: string;
    operation: string;
    currencyCode: string;
    status: string;
  };
  user: string;
  sourceType: string;
  operationType: string;
  amount: number;
  businessDate: string;
  eligibility: { reversible: boolean; reason: string | null };
}

export interface ReversalSearch {
  items: ReversalCandidate[];
  totalFilteredRecords: number;
  offset: number;
  limit: number;
}

export interface ReversalDetail {
  historyId: string;
  sourceType: string;
  businessDate: string;
  operation: string;
  currencyCode: string;
  amount: number;
  cashAmount: number;
  checkAmount: number;
  originalDirection: 'IN' | 'OUT' | 'SWAP';
  eligibility: { reversible: boolean; reason: string | null };
  checks: ReversalCheck[];
  denominations: ReversalDenomination[];
  returnedCashDenominations: ReversalLine[];
  reversalId: number | null;
}

export interface ReversalRequest {
  historyId: string;
  idempotencyKey: string;
  authorizationNumber: string;
  cashDenominations: ReversalQuantity[];
  returnedCashDenominations: ReversalQuantity[];
  checks: Pick<ReversalCheck, 'id' | 'bankId' | 'checkNumber' | 'amount'>[];
}

export interface ReversalPreview {
  original: ReversalDetail;
  cashDenominations: ReversalLine[];
  returnedCashDenominations: ReversalLine[];
  cashDirection: 'IN' | 'OUT' | 'SWAP';
  cashEffect: number;
  checkEffect: number;
  accountingStrategy: string;
}

export interface ReversalResult {
  id: number;
  historyId: string;
  originalHistoryId: string;
  currencyCode: string;
  amount: number;
  cashEffect: number;
  checkEffect: number;
  reversedAt: string;
  sourceReversalReference: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionReversalService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/transaction-reversals';

  context(): Observable<ReversalContext> {
    return this.http.get<ReversalContext>(`${this.path}/context`);
  }

  search(transactionDate: string, offset: number, limit: number): Observable<ReversalSearch> {
    const params = new HttpParams().set('transactionDate', transactionDate).set('offset', offset).set('limit', limit);
    return this.http.get<ReversalSearch>(`${this.path}/transactions`, { params });
  }

  detail(historyId: string): Observable<ReversalDetail> {
    return this.http.get<ReversalDetail>(`${this.path}/${encodeURIComponent(historyId)}`);
  }

  preview(request: ReversalRequest): Observable<ReversalPreview> {
    return this.http.post<ReversalPreview>(`${this.path}/preview`, request);
  }

  reverse(request: ReversalRequest): Observable<ReversalResult> {
    return this.http.post<ReversalResult>(this.path, request);
  }
}
