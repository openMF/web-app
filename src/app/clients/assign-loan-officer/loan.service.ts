/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/**
 * Loan Service
 */
@Injectable({
  providedIn: 'root'
})
export class LoanService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Loan Officers
   */
  getLoanOfficers(loanId: any) {
    const httpParams = new HttpParams()
      .set('template', 'true');
    return this.http.get(`/loans/${loanId}`, { params: httpParams });
  }

  /**
   * @param {nmber} loanId Id of loan to which Loan officer is to be assigned.
   * @param {any} formData data of form to update loan officer.
   * @returns {Observable<any>}
   */
  assignLoanOfficer(loanId: number, formData: any) {
    const httpParams = new HttpParams()
      .set('command', 'assignLoanOfficer');
    return this.http.post(`/loans/${loanId}`, formData, { params: httpParams });
  }
}
