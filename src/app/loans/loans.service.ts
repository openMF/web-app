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
   * @param {string} params Params object having Client ID and Product ID.
   * @returns {Observable<any>} Fixed Deposit Account Template Data.
   */
  getLoanAccountsTemplateResource(params: any): Observable<any> {
    return this.http.get('/loans/template/', { params: params });
  }

  getLoanAccountsData(loanId: string, resourceType: string, resourceId: string, params: any): Observable<any> {
    return this.http.get(`/loans/${loanId}/${resourceType}/${resourceId}`, { params: params });
  }

  createLoanAccount(loanAccount: string): Observable<any> {
    return this.http.post('/loans', loanAccount);
  }

  updateLoanAccount(loanId: string, loanAccount: any): Observable<any> {
    return this.http.put(`/loans/${loanId}`, loanAccount);
  }
}
