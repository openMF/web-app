/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Savings Service.
 */
@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  constructor(private http: HttpClient) {}

  /**
   * @param {string} savingAccountId is saving account's Id.
   * @returns {Observable<any>}
   */
  getSavingsTransactionTemplateResource(savingAccountId: string): Observable<any> {
    return this.http.get(`/savingsaccounts/${savingAccountId}/transactions/template`);
  }

  /**
   * @param {string} action transaction type.
   * @param {string} savingAccountId saving account id.
   * @param {any} transactionData transaction details for saving account.
   * @returns {Observable<any>}
   */
  makeTransaction(action: string, savingAccountId: string, transactionData: any): Observable<any> {
    return this.http.post(`/savingsaccounts/${savingAccountId}/transactions?command=${action}`, transactionData);
  }

  /**
   * @param {string} savingAccountId saving account id.
   * @returns {Observable<any>}
   */
  getSavingsChargeTemplateResource(savingAccountId: string): Observable<any> {
    return this.http.get(`/savingsaccounts/${savingAccountId}/charges/template`);
  }

  /**
   * @param {any} savingsCharge to apply on a savings Account.
   * @returns {Observable<any>}
   */
  createSavingsCharge(savingAccountId: string, resourceType: string, savingsCharge: any): Observable<any> {
    return this.http.post(`/savingsaccounts/${savingAccountId}/${resourceType}`, savingsCharge);
  }

  /**
   * @param {string} chargeId Charge ID of charge.
   * @returns {Observable<any>} Charge.
   */
  getChargeTemplate(chargeId: string): Observable<any> {
    const params = { template: 'true' };
    return this.http.get(`/charges/${chargeId}`, { params: params });
  }

  /**
   * @param accountId Savings Account Id of account to get data for.
   * @returns {Observable<any>} Savings data.
   */
  getSavingsAccountData(accountId: string): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'all');
    return this.http.get(`/savingsaccounts/${accountId}`, { params: httpParams });
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
   * @returns {Observable<any>}
   */
  getSavingsDatatables(): Observable<any> {
    const httpParams = new HttpParams().set('apptable', 'm_savings_account');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  /**
   * @param accountId account Id of savings account to get datatable for.
   * @param datatableName Data table name.
   * @returns {Observable<any>}
   */
  getSavingsDatatable(accountId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${accountId}`, { params: httpParams });
  }

  /**
   * @param accountId account Id of savings account to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  addSavingsDatatableEntry(accountId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param accountId account Id of savings account to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  editSavingsDatatableEntry(accountId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param accountId account Id of savings account to get add datatable entry for.
   * @param datatableName Data Table name.
   * @returns {Observable<any>}
   */
  deleteDatatableContent(accountId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${accountId}`, { params: httpParams });
  }

}
