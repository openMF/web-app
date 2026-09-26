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

export interface ReturnedCheckSearchFilters {
  date: string;
  customerName: string;
  tellerId: FineractId;
  currencyCode: string;
  offset?: number;
  limit?: number;
}

export interface ReturnedCheckSearchResult {
  id: FineractId;
  depositCheckDetailId: FineractId;
  checkNumber: string;
  clientId: FineractId;
  customerName: string;
  savingsAccountId?: FineractId;
  savingsAccountNo?: string;
  amount: number | string;
  currencyCode: string;
  returnedOnDate: string;
  status: 'RETURNED' | 'SETTLED';
  tellerId: FineractId;
  cashierId?: FineractId;
  officeId: FineractId;
  officeName: string;
}

export interface ReturnedCheckSearchPage {
  pageItems: ReturnedCheckSearchResult[];
  totalFilteredRecords: number;
}

export interface ReturnedCheckDetail extends ReturnedCheckSearchResult {
  depositId: FineractId;
  originalReceiptNumber: string;
  checkType: string;
  bank: string;
  returnReason: string;
  settlementId?: FineractId;
  settlementReceiptNumber?: string;
  settledOnUtc?: string;
}

export interface ReturnedCheckDenomination {
  denominationId: string;
  value: number;
  quantity: number;
}

export interface ReturnedCheckPaymentPayload {
  idempotencyKey: string;
  locale: string;
  dateFormat: string;
  transactionDate: string;
  cashReceived: number;
  currencyCode: string;
  paymentTypeId: FineractId;
  note?: string;
  denominations: ReturnedCheckDenomination[];
}

export interface ReturnedCheckReceipt {
  receiptNumber: string;
  status: 'RETURNED' | 'SETTLED';
  failureMessage?: string;
  returnedCheckId: FineractId;
  depositCheckDetailId: FineractId;
  checkNumber: string;
  clientId: FineractId;
  customerName: string;
  checkAmount: number | string;
  cashReceived: number | string;
  changeAmount: number | string;
  currencyCode: string;
  tellerId: FineractId;
  cashierId: FineractId;
  cashierTransactionId: FineractId;
  operatorId: FineractId;
  operatorName: string;
  officeId: FineractId;
  officeName: string;
  createdOnUtc: string;
  completedOnUtc: string;
  denominations: ReturnedCheckDenomination[];
}

export interface BaseTellerOption {
  id: FineractId;
  name?: string;
  value?: string;
  code?: string;
  isCashPayment?: boolean;
}

export type ServicePaymentPayerType = 'CLIENT' | 'NON_CLIENT';
export type ServicePaymentCommissionType = 'NONE' | 'FIXED' | 'PERCENTAGE';
export type ServicePaymentAmount = number | string;

export interface ServicePaymentDenominationConfiguration {
  identifier: string;
  value: ServicePaymentAmount;
  type: string;
}

export interface ServicePaymentServiceConfiguration {
  id: FineractId;
  code: string;
  name: string;
  active: boolean;
  currencyCode: string;
  commissionType: ServicePaymentCommissionType;
  commissionValue: ServicePaymentAmount;
  commissionVatRate: ServicePaymentAmount;
  denominations: ServicePaymentDenominationConfiguration[];
}

export interface ServicePaymentClient {
  clientId: FineractId;
  accountNo: string;
  externalId?: string;
  displayName: string;
  officeId: FineractId;
  officeName: string;
  status: string;
}

export interface ServicePaymentQuoteRequest {
  payerType: ServicePaymentPayerType;
  clientId?: FineractId;
  payerName?: string;
  serviceId: FineractId;
  serviceReference: string;
  baseAmount: ServicePaymentAmount;
  currencyCode: string;
}

export interface ServicePaymentQuote extends ServicePaymentQuoteRequest {
  clientAccountNo?: string;
  payerName: string;
  serviceCode: string;
  serviceName: string;
  commission: ServicePaymentAmount;
  commissionVat: ServicePaymentAmount;
  totalToPay: ServicePaymentAmount;
  businessDate: string;
}

export interface ServicePaymentDenomination {
  denominationId: string;
  value: ServicePaymentAmount;
  quantity: number;
}

export interface ServicePaymentRequest extends ServicePaymentQuoteRequest {
  idempotencyKey: string;
  businessDate: string;
  paymentTypeId: FineractId;
  denominations: ServicePaymentDenomination[];
}

export interface ServicePaymentReceipt {
  transactionId: FineractId;
  receiptNumber: string;
  status: string;
  businessDate: string;
  officeId: FineractId;
  officeName: string;
  tellerId: FineractId;
  tellerName: string;
  cashierId: FineractId;
  cashierName: string;
  operatorId: FineractId;
  operatorName: string;
  payerType: ServicePaymentPayerType;
  clientId?: FineractId;
  clientAccountNo?: string;
  payerName: string;
  serviceId: FineractId;
  serviceCode: string;
  serviceName: string;
  serviceReference: string;
  baseAmount: ServicePaymentAmount;
  commission: ServicePaymentAmount;
  commissionVat: ServicePaymentAmount;
  totalPaid: ServicePaymentAmount;
  amountReceived: ServicePaymentAmount;
  change: ServicePaymentAmount;
  currencyCode: string;
  cashierTransactionId?: FineractId;
  accountingTransactionId?: string;
  createdOnUtc: string;
  completedOnUtc?: string;
  denominations: ServicePaymentDenomination[];
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
  private readonly returnedChecksPath = '/v2/base-teller/returned-checks';
  private readonly servicePaymentsPath = '/v2/base-teller/service-payments';

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

  /** Searches returned checks with the backend's authoritative filter names. */
  searchReturnedChecks(filters: ReturnedCheckSearchFilters): Observable<ReturnedCheckSearchPage> {
    let params = new HttpParams()
      .set('date', filters.date)
      .set('customerName', filters.customerName)
      .set('tellerId', String(filters.tellerId))
      .set('currencyCode', filters.currencyCode);
    if (filters.offset !== undefined) {
      params = params.set('offset', String(filters.offset));
    }
    if (filters.limit !== undefined) {
      params = params.set('limit', String(filters.limit));
    }
    return this.http.get<ReturnedCheckSearchPage>(this.returnedChecksPath, { params });
  }

  /** Retrieves the selected returned check before accepting cash. */
  getReturnedCheck(returnedCheckId: FineractId): Observable<ReturnedCheckDetail> {
    return this.http.get<ReturnedCheckDetail>(`${this.returnedChecksPath}/${returnedCheckId}`);
  }

  /** Settles a returned check with the exact WEB-1234 request DTO. */
  settleReturnedCheck(
    returnedCheckId: FineractId,
    payload: ReturnedCheckPaymentPayload
  ): Observable<ReturnedCheckReceipt> {
    return this.http.post<ReturnedCheckReceipt>(`${this.returnedChecksPath}/${returnedCheckId}/settle`, payload);
  }

  /** Retrieves the authoritative settlement receipt. */
  getReturnedCheckReceipt(receiptNumber: string): Observable<ReturnedCheckReceipt> {
    return this.http.get<ReturnedCheckReceipt>(`${this.returnedChecksPath}/receipts/${receiptNumber}`);
  }

  getReturnedCheckTellers(): Observable<BaseTellerOption[]> {
    return this.http.get<BaseTellerOption[]>('/tellers');
  }

  getReturnedCheckCurrencies(): Observable<{ selectedCurrencyOptions?: BaseTellerOption[] }> {
    return this.http.get<{ selectedCurrencyOptions?: BaseTellerOption[] }>('/currencies');
  }

  getReturnedCheckPaymentTypes(): Observable<BaseTellerOption[]> {
    return this.http.get<BaseTellerOption[]>('/paymenttypes');
  }

  /** Lists the backend-configured active service-payment catalog. */
  getServicePaymentServices(): Observable<ServicePaymentServiceConfiguration[]> {
    return this.http.get<ServicePaymentServiceConfiguration[]>(`${this.servicePaymentsPath}/services`);
  }

  /** Searches the platform client index before resolving the payer through WEB-1236. */
  searchServicePaymentClients(
    searchTerm: string
  ): Observable<DepositSearchResult[] | { pageItems?: DepositSearchResult[] }> {
    const params = new HttpParams().set('exactMatch', 'false').set('query', searchTerm).set('resource', 'clients');
    return this.http.get<DepositSearchResult[] | { pageItems?: DepositSearchResult[] }>('/search', { params });
  }

  /** Resolves an authoritative, office-scoped client payer. */
  getServicePaymentClient(clientId: FineractId): Observable<ServicePaymentClient> {
    return this.http.get<ServicePaymentClient>(`${this.servicePaymentsPath}/clients/${clientId}`);
  }

  /** Gets the backend-authoritative commission, VAT, total, and business date. */
  quoteServicePayment(payload: ServicePaymentQuoteRequest): Observable<ServicePaymentQuote> {
    return this.http.post<ServicePaymentQuote>(`${this.servicePaymentsPath}/quote`, payload);
  }

  /** Posts a cash service payment with the backend idempotency contract. */
  createServicePayment(payload: ServicePaymentRequest): Observable<ServicePaymentReceipt> {
    return this.http.post<ServicePaymentReceipt>(this.servicePaymentsPath, payload);
  }

  /** Retrieves the immutable backend receipt for display or reprint. */
  getServicePaymentReceipt(transactionId: FineractId): Observable<ServicePaymentReceipt> {
    return this.http.get<ServicePaymentReceipt>(`${this.servicePaymentsPath}/${transactionId}/receipt`);
  }
}
