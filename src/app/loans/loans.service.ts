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
  getLoanAccountDetails(loanId: string) {
    return this.http.get(`/loans/${loanId}`);
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

  /*
   * @param {string} loanId Loan Id.
   * @param {any} data Data.
   * @returns {Observable<any>}
   */
  loanActionButtons(loanId: string, data: any, command: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/loans/${loanId}`, data, {params: httpParams});
  }

  getForeclosureData(loanId: any, foreclosuredata: any) {
    const httpParams = new HttpParams().set('command', foreclosuredata.command)
                                       .set('dateFormat', foreclosuredata.dateFormat)
                                       .set('locale', foreclosuredata.locale)
                                       .set('transactionDate', foreclosuredata.transactionDate);
    return this.http.get(`/loans/${loanId}/transactions/template`, {params: httpParams});

  }

  loanForclosureData(loanId: any, data: any) {
    const httpParams = new HttpParams().set('command', 'foreclosure');
    return this.http.post(`/loans/${loanId}/transactions`, data, {params: httpParams});
  }

}
