/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  /**
   * @param {any} loanCharge to apply on a Loan Account.
   * @returns {Observable<any>}
   */
  createLoanCharge(loanId: string, resourceType: string, loanCharge: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/${resourceType}`, loanCharge);
  }

  getLoanAccountDetails(loanId: string) {
    return this.http.get(`/loans/${loanId}`);
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

}
