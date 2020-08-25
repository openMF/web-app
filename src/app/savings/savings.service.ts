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
    const httpParams = new HttpParams().set('associations', 'all' );
    return this.http.get(`/savingsaccounts/${accountId}`, { params: httpParams });
  }

  /**
   * @param accountId Savings Account Id of account to get data for.
   * @returns {Observable<any>} Savings account and template.
   */
  getSavingsAccountAndTemplate(accountId: string, template: boolean): Observable<any> {
    const httpParams = new HttpParams()
      .set('template', template.toString())
      .set('associations', 'charges' );
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

  /**
   * @param entityId Entity Id assosciated with savings account.
   * @returns {Observable<any>} Savings account template.
   */
  getSavingsAccountTemplate(entityId: string, productId?: string, isGroup?: boolean): Observable<any> {
    let httpParams = new HttpParams().set( isGroup ? 'groupId' : 'clientId', entityId);
    httpParams = productId ? httpParams.set('productId', productId) : httpParams;
    return this.http.get('/savingsaccounts/template', { params: httpParams });
  }

  /**
   * @param {any} savingsAccount Savings Account
   * @returns {Observable<any>}
   */
  createSavingsAccount(savingsAccount: any): Observable<any> {
    return this.http.post('/savingsaccounts', savingsAccount);
  }

  /**
   * @param {any} savingsAccount Savings Account
   * @returns {Observable<any>}
   */
  updateSavingsAccount(accountId: string, savingsAccount: any): Observable<any> {
    return this.http.put(`/savingsaccounts/${accountId}`, savingsAccount);
  }

  /**
   * @param {string} accountId savings account Id
   * @returns {Observable<any>}
   */
  deleteSavingsAccount(accountId: string): Observable<any> {
    return this.http.delete(`/savingsaccounts/${accountId}`);
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeSavingsAccountCommand(accountId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/savingsaccounts/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeSavingsAccountUpdateCommand(accountId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.put(`/savingsaccounts/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getSavingsAccountTransaction(accountId: string, transactionId: string): Observable<any> {
    return this.http.get(`/savingsaccounts/${accountId}/transactions/${transactionId}`);
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getSavingsAccountTransactionTemplate(accountId: string, transactionId: string): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/savingsaccounts/${accountId}/transactions/${transactionId}`, { params: httpParams });
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  executeSavingsAccountTransactionsCommand(accountId: string, command: string, data: any, transactionId?: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    if (transactionId) {
      return this.http.post(`/savingsaccounts/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
    }
    return this.http.post(`/savingsaccounts/${accountId}/transactions`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId savings account Id
   * @param {string} chargeId savings charge Id
   * @returns {Observable<any>}
   */
  getSavingsAccountCharge(accountId: string, chargeId: string): Observable<any> {
    return this.http.get(`/savingsaccounts/${accountId}/charges/${chargeId}`);
  }

  /**
   * @param {string} accountId Savings Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} chargeId Charge Id
   * @returns {Observable<any>}
   */
  executeSavingsAccountChargesCommand(accountId: string, command: string, data: any, chargeId: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/savingsaccounts/${accountId}/charges/${chargeId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId  Savings Account Id
   * @param {any} data Charge Data
   * @param {any} chargeId Charge Id
   * @returns {Observable<any>}
   */
  editSavingsAccountCharge(accountId: string, data: any, chargeId: any): Observable<any> {
    return this.http.put(`/savingsaccounts/${accountId}/charges/${chargeId}`, data);
  }

  /**
   * @param {string} accountId  Savings Account Id
   * @param {any} chargeId Charge Id
   * @returns {Observable<any>}
   */
  deleteSavingsAccountCharge(accountId: string, chargeId: any): Observable<any> {
    return this.http.delete(`/savingsaccounts/${accountId}/charges/${chargeId}`);
  }

}
