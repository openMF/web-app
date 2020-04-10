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
  constructor(private http: HttpClient) {}
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
    /**
     * @param {string} loanId loanId of the loan.
     * @param {string} command type of transaction template.
     * @returns {Observable<any>}
     */
  getLoanTransactionTemplate(loanId: string, command: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/transactions/template?command=${command}`);
  }
    /**
     * @param {string} loanId loanId of the loan.
     * @param {any} loanTransactionData transaction data for the repayment
     * @returns {Observable<any>}
     */
  makeRepayment(loanId: string, loanTransactionData: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/transactions?command=repayment`, loanTransactionData);
  }
}
