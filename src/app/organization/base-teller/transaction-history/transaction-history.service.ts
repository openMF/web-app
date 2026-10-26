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

import {
  TransactionHistoryContext,
  TransactionHistoryDenominations,
  TransactionHistoryDetail,
  TransactionHistoryFilters,
  TransactionHistoryReceipt,
  TransactionHistoryReport,
  TransactionHistorySearch
} from './transaction-history.models';

@Injectable({ providedIn: 'root' })
export class TransactionHistoryService {
  private readonly http = inject(HttpClient);
  private readonly path = '/v2/base-teller/transaction-history';

  getContext(): Observable<TransactionHistoryContext> {
    return this.http.get<TransactionHistoryContext>(`${this.path}/context`);
  }

  search(filters: TransactionHistoryFilters = {}): Observable<TransactionHistorySearch> {
    return this.http.get<TransactionHistorySearch>(this.path, { params: this.params(filters, true) });
  }

  getDetail(historyId: string): Observable<TransactionHistoryDetail> {
    return this.http.get<TransactionHistoryDetail>(`${this.path}/${encodeURIComponent(historyId)}`);
  }

  getDenominations(historyId: string): Observable<TransactionHistoryDenominations> {
    return this.http.get<TransactionHistoryDenominations>(
      `${this.path}/${encodeURIComponent(historyId)}/denominations`
    );
  }

  getReceipt(historyId: string): Observable<TransactionHistoryReceipt> {
    return this.http.get<TransactionHistoryReceipt>(`${this.path}/${encodeURIComponent(historyId)}/receipt`);
  }

  getReport(filters: TransactionHistoryFilters = {}): Observable<TransactionHistoryReport> {
    return this.http.get<TransactionHistoryReport>(`${this.path}/report`, { params: this.params(filters, false) });
  }

  private params(filters: TransactionHistoryFilters, paged: boolean): HttpParams {
    let params = new HttpParams();
    const values: Record<string, string | number | undefined> = {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      tellerId: filters.tellerId,
      currencyCode: filters.currencyCode,
      status: filters.status,
      type: filters.type,
      operation: filters.operation,
      concept: filters.concept,
      reference: filters.reference?.trim() || undefined,
      sort: filters.sort,
      order: filters.order
    };
    if (paged) {
      values['offset'] = filters.offset;
      values['limit'] = filters.limit;
    }
    Object.entries(values).forEach(
      ([
        name,
        value
      ]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(name, String(value));
        }
      }
    );
    return params;
  }
}
