/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Recurring Deposits Service.
 */
@Injectable({
  providedIn: 'root'
})
export class RecurringDepositsService {

  constructor(private http: HttpClient) { }

  /**
   * @params recurringDepositAccountId
   * Returns the details of a particular Recurring Deposit Account
   */
  getRecurringDepositsAccountData(recurringDepositAccountId: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('associations', 'all');
    return this.http.get(`/recurringdepositaccounts/${recurringDepositAccountId}`, { params: httpParams });
  }

  /**
   * @param clientId Client Id
   * @param clientName Client Name
   * @param fromAccountId Account Id
   * @param locale Locale
   * @param dateFormat Date Format
   * @returns {Observable<any>} Standing Instructions
   */
  getStandingInstructions(
    clientId: string, clientName: string, fromAccountId: string,
    locale: string, dateFormat: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('clientId', clientId)
      .set('clientName', clientName)
      .set('fromAccountId', fromAccountId)
      .set('fromAccountType', '2')
      .set('locale', locale)
      .set('dateFormat', dateFormat);
    return this.http.get(`/standinginstructions`, { params: httpParams });
  }

  /**
   * Returns Recurring Deposit Account Template Data
   * @param clientId Client ID
   * @param productId Product ID
   */
  getRecurringDepositsAccountTemplate(clientId: any, productId?: any): Observable<any> {
    let httpParams = new HttpParams().set('clientId', clientId);
    httpParams = productId ? httpParams.set('productId', productId) : httpParams;
    return this.http.get(`/recurringdepositaccounts/template`, { params: httpParams });
  }

  /**
   * Post Request to create a recurring deposit account
   * @param recurringAccountData Recurring Deposit Account Data
   */
  createRecurringDepositAccount(recurringAccountData: any): Observable<any> {
    return this.http.post(`/recurringdepositaccounts`, recurringAccountData);
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeRecurringDepositsAccountCommand(accountId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/recurringdepositaccounts/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId recurring deposits account Id
   * @returns {Observable<any>}
   */
  deleteRecurringDepositsAccount(accountId: string): Observable<any> {
    return this.http.delete(`/recurringdepositaccounts/${accountId}`);
  }

  /**
   * Get Recurring Deposits Account and Template Data
   * @param accountId Account ID
   */
  getRecurringDepositsAccountAndTemplate(accountId: any) {
    const httpParams = new HttpParams().set('associations', 'charges')
      .set('template', 'true');
    return this.http.get(`/recurringdepositaccounts/${accountId}`, { params: httpParams });
  }

  /**
   * @param {any} accountId Account Id
   * @param {any} recurringDepositAccountData Recurring Deposit Account Data
   * @returns {Observable<any>}
   */
  updateRecurringDepositAccount(accountId: any, recurringDepositAccountData: any): Observable<any> {
    return this.http.put(`/recurringdepositaccounts/${accountId}`, recurringDepositAccountData);
  }

  /**
   * Returns the template for the recurring deposits action
   * @param accountId Account Id
   * @param command Command
   */
  getRecurringDepositAccountActionResource(accountId: any, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.get(`/recurringdepositaccounts/${accountId}/template`, { params: httpParams });
  }

  /**
   * Returns the transaction template for the recurring deposits action
   * @param accountId Account Id
   * @param command Command
   */
  getRecurringDepositAccountTransactionTemplateResource(accountId: any, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.get(`/recurringdepositaccounts/${accountId}/transactions/template`, { params: httpParams });
  }
  /*
   * @param {string} accountId Recurring Deposits Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getRecurringDepositsAccountTransaction(accountId: string, transactionId: string): Observable<any> {
    return this.http.get(`/recurringdepositaccounts/${accountId}/transactions/${transactionId}`);
  }

  /**
   * @param {string} accountId Recuring Deposits Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getRecurringDepositsAccountTransactionTemplate(accountId: string, transactionId: string): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/recurringdepositaccounts/${accountId}/transactions/${transactionId}`, { params: httpParams });
  }

  /**
   * @param {string} accountId Recurring Deposits Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  executeRecurringDepositsAccountTransactionsCommand(accountId: string, command: string, data: any, transactionId?: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/recurringdepositaccounts/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
  }

}
