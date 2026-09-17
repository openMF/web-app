/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

export type FineractId = string | number;

export interface DepositSearchResult {
  id?: FineractId;
  entityId?: FineractId;
  accountId?: FineractId;
  clientId?: FineractId;
  accountNo?: string;
  entityAccountNo?: string;
  displayName?: string;
  entityName?: string;
  name?: string;
  entityType?: string;
  subEntityType?: string;
  accountType?: string;
}

export interface DepositClient {
  id?: FineractId;
  accountNo?: string;
  displayName?: string;
  fullname?: string;
  name?: string;
  externalId?: string;
}

export interface DepositSavingsAccount {
  id?: FineractId;
  accountId?: FineractId;
  savingsId?: FineractId;
  accountNo?: string;
  accountNumber?: string;
  productName?: string;
  savingsProductName?: string;
  clientId?: FineractId;
  clientName?: string;
  clientDisplayName?: string;
  currency?: { code?: string };
  currencyCode?: string;
  status?:
    | {
        active?: boolean;
        value?: string;
        code?: string;
      }
    | string;
  summary?: {
    accountBalance?: number | null;
    availableBalance?: number | null;
  };
  accountBalance?: number | null;
}

export interface DepositClientAccounts {
  savingsAccounts?: DepositSavingsAccount[];
  savingAccounts?: DepositSavingsAccount[];
}

export interface DepositPaymentType {
  id: FineractId;
  name?: string;
  value?: string;
  description?: string;
  isCashPayment?: boolean;
  position?: number;
  codeName?: string;
  isSystemDefined?: boolean;
}

export interface SavingsDepositTemplate {
  paymentTypeOptions?: DepositPaymentType[];
}

export interface SavingsDepositCommandPayload {
  transactionDate: string;
  transactionAmount: number;
  paymentTypeId: FineractId;
  dateFormat: string;
  locale: string;
  accountNumber?: string;
  checkNumber?: string;
  routingCode?: string;
  receiptNumber?: string;
  bankNumber?: string;
  note?: string;
}

export interface SavingsDepositCommandResult {
  resourceId?: FineractId;
  entityId?: FineractId;
  transactionId?: FineractId;
  savingsId?: FineractId;
  changes?: Record<string, unknown>;
}

export interface SavingsDepositReceipt extends SavingsDepositCommandResult {
  id?: FineractId;
  accountNo?: string;
  accountNumber?: string;
  amount?: number | null;
  transactionAmount?: number | null;
  runningBalance?: number | null;
  cumulativeBalance?: number | null;
  paymentDetailData?: {
    receiptNumber?: string;
    paymentType?: {
      name?: string;
    };
  };
  transactionType?: {
    value?: string;
  };
}

/**
 * Base Teller service.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseTellerService {
  private http = inject(HttpClient);

  private readonly savingsAccountOpeningsPath = '/v2/base-teller/savings-account-openings';

  /**
   * Searches customers through the Base Teller savings-opening workflow API.
   */
  searchSavingsOpeningCustomers(searchTerm: string, limit: number = 20): Observable<any> {
    const params = new HttpParams().set('q', searchTerm).set('limit', String(limit));
    return this.http.get(`${this.savingsAccountOpeningsPath}/customers`, { params });
  }

  /**
   * Retrieves customer position/details for the Base Teller savings-opening workflow.
   */
  getSavingsOpeningCustomerPosition(clientId: string | number): Observable<any> {
    return this.http.get(`${this.savingsAccountOpeningsPath}/customers/${clientId}/position`);
  }

  /**
   * Retrieves eligible savings products.
   */
  getSavingsOpeningProducts(currencyCode?: string): Observable<any> {
    let params = new HttpParams();
    if (currencyCode) {
      params = params.set('currencyCode', currencyCode);
    }
    return this.http.get(`${this.savingsAccountOpeningsPath}/products`, { params });
  }

  /**
   * Opens and initially funds a savings account through the merged Base Teller workflow endpoint.
   */
  createSavingsAccountOpening(payload: any): Observable<any> {
    return this.http.post(this.savingsAccountOpeningsPath, payload);
  }

  /**
   * Retrieves an authoritative receipt when the backend exposes it separately.
   */
  getSavingsOpeningReceipt(receiptNumber: string | number): Observable<any> {
    return this.http.get(`${this.savingsAccountOpeningsPath}/${receiptNumber}`);
  }

  /**
   * Searches clients and savings accounts using the authoritative platform search endpoint.
   */
  searchDepositCustomersAndAccounts(
    searchTerm: string
  ): Observable<DepositSearchResult[] | { pageItems?: DepositSearchResult[] }> {
    const params = new HttpParams()
      .set('exactMatch', 'false')
      .set('query', searchTerm)
      .set('resource', 'clients,savings');
    return this.http.get<DepositSearchResult[] | { pageItems?: DepositSearchResult[] }>('/search', { params });
  }

  /**
   * Retrieves a client profile.
   */
  getDepositClient(clientId: FineractId): Observable<DepositClient> {
    return this.http.get<DepositClient>(`/clients/${clientId}`);
  }

  /**
   * Retrieves the customer's accounts so an existing active savings account can be selected.
   */
  getDepositClientAccounts(clientId: FineractId): Observable<DepositClientAccounts> {
    return this.http.get<DepositClientAccounts>(`/clients/${clientId}/accounts`);
  }

  /**
   * Retrieves the selected savings account with server-provided balances and status.
   */
  getDepositSavingsAccount(savingsId: FineractId): Observable<DepositSavingsAccount> {
    const params = new HttpParams().set('associations', 'all');
    return this.http.get<DepositSavingsAccount>(`/savingsaccounts/${savingsId}`, { params });
  }

  /**
   * Retrieves payment type options for the savings transaction command.
   */
  getSavingsDepositTemplate(savingsId: FineractId): Observable<SavingsDepositTemplate> {
    return this.http.get<SavingsDepositTemplate>(`/savingsaccounts/${savingsId}/transactions/template`);
  }

  /**
   * Deposits funds into an existing savings account.
   */
  depositToSavingsAccount(
    savingsId: FineractId,
    payload: SavingsDepositCommandPayload
  ): Observable<SavingsDepositCommandResult> {
    const params = new HttpParams().set('command', 'deposit');
    return this.http.post<SavingsDepositCommandResult>(`/savingsaccounts/${savingsId}/transactions`, payload, {
      params
    });
  }

  /**
   * Retrieves the saved transaction as the authoritative receipt/details response.
   */
  getSavingsDepositReceipt(savingsId: FineractId, transactionId: FineractId): Observable<SavingsDepositReceipt> {
    return this.http.get<SavingsDepositReceipt>(`/savingsaccounts/${savingsId}/transactions/${transactionId}`);
  }
}
