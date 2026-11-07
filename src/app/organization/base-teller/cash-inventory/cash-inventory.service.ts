/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CashInventoryCustodianType = 'TELLER' | 'VAULT' | 'TRANSIT';
export type CashInventoryTransactionType = 'CASH' | 'CHECK';
export type CashInventoryAmount = number | string;

export interface CashInventoryCustodian {
  key: string;
  type: CashInventoryCustodianType;
  resourceId: number;
  code: string;
  name: string;
}

export interface CashInventoryTransactionTypeOption {
  code: CashInventoryTransactionType;
  name: string;
}

export interface CashInventoryCurrency {
  code: string;
  name: string;
  decimalPlaces: number;
}

export interface CashInventoryContext {
  custodians: CashInventoryCustodian[];
  transactionTypes: CashInventoryTransactionTypeOption[];
  currencies: CashInventoryCurrency[];
}

export interface CashInventoryRow {
  custodianKey: string;
  custodianType: CashInventoryCustodianType;
  resourceId: number;
  userId: number | null;
  userCode: string;
  name: string;
  inventoryType: CashInventoryTransactionType;
  currencyCode: string;
  decimalPlaces: number;
  initialBalance: CashInventoryAmount;
  accumulatedInflows: CashInventoryAmount;
  accumulatedOutflows: CashInventoryAmount;
  cutOffs: CashInventoryAmount;
  balance: CashInventoryAmount;
  lastCutOffAt: string | null;
  lastCutOffAmount: CashInventoryAmount | null;
  asOf: string;
}

export interface CashInventoryFilters {
  custodianKey?: string | null;
  transactionType?: CashInventoryTransactionType | null;
  currencyCode?: string | null;
  showLastCutOff?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CashInventoryService {
  private readonly http = inject(HttpClient);
  private readonly inventoryPath = '/v2/base-teller/cash-inventory';

  getContext(): Observable<CashInventoryContext> {
    return this.http.get<CashInventoryContext>(`${this.inventoryPath}/context`);
  }

  getInventory(filters: CashInventoryFilters = {}): Observable<CashInventoryRow[]> {
    let params = new HttpParams();
    if (filters.custodianKey) {
      params = params.set('custodianKey', filters.custodianKey);
    }
    if (filters.transactionType) {
      params = params.set('transactionType', filters.transactionType);
    }
    if (filters.currencyCode) {
      params = params.set('currencyCode', filters.currencyCode);
    }
    if (filters.showLastCutOff) {
      params = params.set('showLastCutOff', 'true');
    }
    return this.http.get<CashInventoryRow[]>(this.inventoryPath, { params });
  }
}
