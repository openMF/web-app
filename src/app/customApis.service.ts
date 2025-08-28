/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../environments/environment';

// loans.service.ts
@Injectable({
  providedIn: 'root'
})
export class LoansService {
  constructor(private http: HttpClient) {}

  //not available in the fineract.yaml (pr by alberto #2564)
  getDeferredIncomeData(loanId: string) {
    return this.http.get(`/loans/${loanId}/deferredincome`);
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */

  // did not find this in endpoint in fineract.yaml ( transactions-tab.component.ts)
  executeLoansAccountTransactionsCommand(
    accountId: string,
    command: string,
    data: any,
    transactionId?: any
  ): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    if (transactionId) {
      return this.http.post(`/loans/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
    }
    return this.http.post(`/loans/${accountId}/transactions`, data, { params: httpParams });
  }

  // did not find this /loans/${loanId}/documents endpoint in fineract.yaml (loan-documents-tab.component.ts)

  //I tried to use   /v1/{entityType}/{entityId}/documents: insted of /loans/{loanId}/documents, but there was issue The problem is that the OpenAPI client expects the file field as uploadedInputStream, but the backend expects the field to be named InputStream. This mismatch causes the 400 error.

  loadLoanDocument(loanId: any, data: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/documents`, data);
  }

  downloadLoanDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/loans/${parentEntityId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  deleteLoanDocument(loanId: any, documentId: any): Observable<any> {
    return this.http.delete(`/loans/${loanId}/documents/${documentId}`);
  }

  // did not find this in endpoint in fineract.yaml (notes-tab.component.ts)
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

  getBuyDownFeeData(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/buydown-fees`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class RunReportsService {
  constructor(private http: HttpClient) {}

  /**
   * @param {number} staffId Staff Id to get centers from.
   * @returns {Observable<any>} Centers
   */
  getCentersFromStaffId(staffId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_staffId', staffId.toString()).set('genericResultSet', false.toString());
    return this.http.get('/runreports/GroupNamesByStaff', { params: httpParams });
  }

  /**
   * @param {number} centerId Center ID of center
   * @returns {Observable<any>} Center
   */
  getCenter(centerId: number): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'groupMembers');
    return this.http.get(`/centers/${centerId}`, { params: httpParams });
  }

  /**
   * @param {number} centerId Center ID of center to retrieve summary of
   * @returns {Observable<any>} Center Accounts
   */
  getCenterSummary(centerId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_groupId', centerId.toString()).set('genericResultSet', false.toString());
    return this.http.get('/runreports/GroupSummaryCounts', { params: httpParams });
  }
}

/**
 * Account Transfers Service.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountTransfersService {
  constructor(private http: HttpClient) {}

  deleteStandingInstrucions(id: any) {
    const httpParams = new HttpParams().set('command', 'delete');
    return this.http.delete(`/standinginstructions/${id}`, { params: httpParams });
  }

  sendInterbankTransfer(body: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/executetransfer`,
      body,
      { headers }
    );
  }

  getAccountByNumber(accountNumber: string, currency: string): Observable<any> {
    const payload = {
      partyId: accountNumber,
      partyIdType: 'MSISDN',
      currencyCode: currency
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(
        `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/participant`,
        JSON.stringify(payload),
        { headers }
      )
      .pipe(
        switchMap((participant: any) => {
          const body = JSON.stringify({ ...payload, ownerFspId: participant.fspId });
          return this.http.post(
            `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/partyinfo`,
            body,
            { headers }
          );
        })
      );
  }
}
