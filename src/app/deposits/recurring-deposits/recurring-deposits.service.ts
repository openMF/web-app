/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * RecurringDeposits Service.
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
}
