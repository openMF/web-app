/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Loans service.
 */
@Injectable({
  providedIn: 'root'
})
export class LoansService {
  constructor(private http: HttpClient) { }
  /**
   * @param {string} loanId loanId of the loan.
   * @returns {Observable<any>}
   */
  getLoanChargeTemplateResource(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/charges/template`);
  }

  getLoanActionTemplate(loanId: string, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.get(`/loans/${loanId}/transactions/template`, { params: httpParams });
  }

  getLoanAccountResource(loanId: string, associations: string): Observable<any> {
    const httpParams = new HttpParams().set('associations', associations);
    return this.http.get(`/loans/${loanId}`, { params: httpParams });
  }

  getGuarantorTemplate(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/guarantors/template`);
  }

  createNewGuarantor(loanId: string, data: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/guarantors`, data);
  }

  deleteGuarantor(loanId: any, guarantorId: any): Observable<any> {
    return this.http.delete(`/loans/${loanId}/guarantors/${guarantorId}`);
  }

  deleteLoanAccount(loanId: any): Observable<any> {
    return this.http.delete(`/loans/${loanId}`);
  }

  /**
   * Returns the loan template data with specific condition
   * @param loanId Loan Id
   */
  getLoanTemplate(loanId: string): Observable<any> {
    const httpParams = new HttpParams()
                      .set('fields', 'id,loanOfficerId,loanOfficerOptions')
                      .set('staffInSelectedOfficeOnly', 'true')
                      .set('template', 'true');
    return this.http.get(`/loans/${loanId}`, { params: httpParams });
  }

  /**
   * @param {any} loanCharge to apply on a Loan Account.
   * @returns {Observable<any>}
   */
  createLoanCharge(loanId: string, resourceType: string, loanCharge: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/${resourceType}`, loanCharge);
  }

  /**
   * Get Loan Account Details
   * @param loanId Loan Id
   */
  getLoanAccountDetails(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}`);
  }

  /**
   * Get collateral template.
   * @param {string} loanId Loan Id.
   * @returns {Observable<any>}
   */
  getLoanCollateralTemplate(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/collaterals/template`);
  }

  /**
   * Create Loan Collateral.
   * @param {string} loanId Loan Id.
   * @param {any} collateralData Collateral Data.
   * @returns {Observable<any>}
   */
  createLoanCollateral(loanId: string, collateralData: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/collaterals`, collateralData);
  }

  /**
   * Get Loans details with httpParams
   * @param loanId Loan ID
   */
  getLoanAccountAssociationDetails(loanId: string) {
    const httpParams = new HttpParams()
      .set('associations', 'all')
      .set('exclude', 'guarantors,futureSchedule');
    return this.http.get(`/loans/${loanId}`, {params: httpParams});
  }

  getApproveAssociationsDetails(loanId: any) {
    const httpParams = new HttpParams()
      .set('associations', 'multiDisburseDetails');
    return this.http.get(`/loans/${loanId}`, { params: httpParams });
  }
  /**
   * @param loanId Loan Id
   * @returns The notes for particular loan
   */
  getLoanNotes(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/notes`);
  }

  /**
   * Adds a note to the particular Loan Id
   * @param loanId Loan ID
   * @param noteData Note Data to be added
   * @returns {Observable<any>}
   */
  createLoanNote(loanId: string, noteData: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/notes`, noteData);
  }

  /**
   * Edits the Loan Note
   * @param loanId Loan ID
   * @param noteId Note ID
   * @param noteData Note Data
   */
  editLoanNote(loanId: string, noteId: string, noteData: any) {
    return this.http.put(`/loans/${loanId}/notes/${noteId}`, noteData);
  }

  /**
   * Deletes the particular Note
   * @param loanId Loan ID
   * @param noteId Note ID
   */
  deleteLoanNote(loanId: string, noteId: string) {
    return this.http.delete(`/loans/${loanId}/notes/${noteId}`);
  }

  /**
   * Used For: Close Action, Prepay Loan Action
   * Returns the response of the action
   * @param loanId Loan Id
   * @param data Data
   * @param command Command
   */
  submitLoanActionButton(loanId: string, data: any, command: any) {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/loans/${loanId}/transactions`, data, {params: httpParams});
  }

  getLoanScreenReportsData(): Observable<any> {
    const httpParams = new HttpParams().set('entityId', '1')
                                       .set('typeId', '0');
    return this.http.get(`/templates`, {params: httpParams});
  }

  /**
   * Get Loan Datatables
   */
  getLoanDataTables() {
    const httpParams = new HttpParams().set('apptable', 'm_loan');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  /**
   * Get Loan Datatable
   * @param loanId Loan ID
   * @param datatableName Datatable Name
   */
  getLoanDatatable(loanId: string, datatableName: string) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${loanId}`, { params: httpParams });
  }

  /**
   * @param loanId Loan Id of loan to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  addLoanDatatableEntry(loanId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${loanId}`, data, { params: httpParams });
  }

  /**
   * @param loanId Loan Id of loan to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  editLoanDatatableEntry(loanId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${loanId}`, data, { params: httpParams });
  }

  /**
   * @param loanId Loan Id of loan to get add datatable entry for.
   * @param datatableName Data Table name.
   * @returns {Observable<any>}
   */
  deleteDatatableContent(loanId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${loanId}`, { params: httpParams });
  }

  /**
   * @param {string} loanId Loan Id.
   * @param {any} data Data.
   * @returns {Observable<any>}
   */
  loanActionButtons(loanId: any, command: any, data?: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/loans/${loanId}`, data, {params: httpParams});
  }

  /**
   * @param {string|number} loanId Loan Id.
   * @param {any} foreclosuredata ForeClosure Data
   */
  getForeclosureData(loanId: string|number, foreclosuredata: any) {
    const httpParams = new HttpParams().set('command', foreclosuredata.command)
                                       .set('dateFormat', foreclosuredata.dateFormat)
                                       .set('locale', foreclosuredata.locale)
                                       .set('transactionDate', foreclosuredata.transactionDate);
    return this.http.get(`/loans/${loanId}/transactions/template`, {params: httpParams});

  }

  /**
   * @param {string|number} loanId Loan Id
   * @param {any} data Data
   */
  loanForclosureData(loanId: any, data: any) {
    const httpParams = new HttpParams().set('command', 'foreclosure');
    return this.http.post(`/loans/${loanId}/transactions`, data, {params: httpParams});
  }

  /**
   * Returns the Reschedule Loans Template
   */
  rescheduleLoanTemplate() {
    return this.http.get('/rescheduleloans/template');
  }

  /**
   * Submits Reschedule Data
   * @param {any} data Data
   */
  submitRescheduleData(data: any) {
    const httpParams = new HttpParams().set('command', 'reschedule');
    return this.http.post('/rescheduleloans', data, {params: httpParams});
  }

  /**
   * Gets Loan Account Template
   * @param {any} clientId Client ID
   * @param {any} productId Product ID
   */
  getLoansAccountTemplateResource(clientId: any, productId?: any): Observable<any> {
    let httpParams = new HttpParams().set('activeOnly', 'true')
                                      .set('clientId', clientId)
                                      .set('staffInSelectedOfficeOnly', 'true')
                                      .set('templateType', 'individual');
    httpParams = productId ? httpParams.set('productId', productId) : httpParams;
    return this.http.get('/loans/template', { params: httpParams });
  }

  getLoansAccountAndTemplateResource(loanId: any): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'charges,collateral,meeting,multiDisburseDetails')
                                       .set('staffInSelectedOfficeOnly', 'true')
                                       .set('template', 'true');
    return this.http.get(`/loans/${loanId}`, { params: httpParams });
  }

  /**
   * Get Loans Collateral Template
   * @param {any} productId Product ID
   */
  getLoansCollateralTemplateResource(productId: any): Observable<any> {
    const httpParams = new HttpParams().set('fields', 'id, loanCollateralOptions')
                                  .set('productId', productId)
                                  .set('templateType', 'collateral');
    return this.http.get('/loans/template', { params: httpParams });
  }

  /**
   * Creates Loans Account
   * @param {any} loanAccount Loan Account
   */
  createLoansAccount(loanAccount: any): Observable<any> {
    return this.http.post('/loans', loanAccount);
  }

  getLoanDocuments(loanId: any): Observable<any> {
    return this.http.get(`/loans/${loanId}/documents`);
  }

  deleteLoanDocument(loanId: any, documentId: any): Observable<any> {
    return this.http.delete(`/loans/${loanId}/documents/${documentId}`);
  }

  loadLoanDocument(loanId: any, data: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/documents`, data);
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
      .set('fromAccountType', '1')
      .set('locale', locale)
      .set('dateFormat', dateFormat)
      .set('limit', '14')
      .set('offset', '0');
    return this.http.get(`/standinginstructions`, { params: httpParams });
  }

  updateLoansAccount(loanId: any, loanData: any): Observable<any> {
    return this.http.put(`/loans/${loanId}`, loanData);
  }

  getTemplateData(templateId: any, loanId: any): Observable<any> {
    const httpParams = new HttpParams().set('loanId', loanId);
    return this.http.post(`/templates/${templateId}`, {}, { params: httpParams, responseType: 'text'});
  }

  /**
   * Get Loan Charge Aproval template.
   * @param {string} loanId Loan Id.
   * @returns {Observable<any>}
   */
  getLoanApprovalTemplate(loanId: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('templateType', 'approval');
    return this.http.get(`/loans/${loanId}/template`, { params: httpParams });
  }

  guarantorAccountResource(loanId: string, clientId: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('clientId', clientId);
    return this.http.get(`/loans/${loanId}/guarantors/accounts/template`, { params: httpParams });
  }

  /**
   * @param {string} accountId loans account Id
   * @param {string} chargeId loans charge Id
   * @returns {Observable<any>}
   */
  getLoansAccountCharge(accountId: string, chargeId: string): Observable<any> {
    return this.http.get(`/loans/${accountId}/charges/${chargeId}`);
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} chargeId Charge Id
   * @returns {Observable<any>}
   */
  executeLoansAccountChargesCommand(accountId: string, command: string, data: any, chargeId: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/loans/${accountId}/charges/${chargeId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId  Loans Account Id
   * @param {any} data Charge Data
   * @param {any} chargeId Charge Id
   * @returns {Observable<any>}
   */
  editLoansAccountCharge(accountId: string, data: any, chargeId: any): Observable<any> {
    return this.http.put(`/loans/${accountId}/charges/${chargeId}`, data);
  }

  /**
   * @param {string} accountId  Loans Account Id
   * @param {any} chargeId Charge Id
   * @returns {Observable<any>}
   */
  deleteLoansAccountCharge(accountId: string, chargeId: any): Observable<any> {
    return this.http.delete(`/loans/${accountId}/charges/${chargeId}`);
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getLoansAccountTransaction(accountId: string, transactionId: string): Observable<any> {
    return this.http.get(`/loans/${accountId}/transactions/${transactionId}`);
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getLoansAccountTransactionTemplate(accountId: string, transactionId: string): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/loans/${accountId}/transactions/${transactionId}`, { params: httpParams });
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  executeLoansAccountTransactionsCommand(accountId: string, command: string, data: any, transactionId?: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    if (transactionId) {
      return this.http.post(`/loans/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
    }
    return this.http.post(`/loans/${accountId}/transactions`, data, { params: httpParams });
  }

}
