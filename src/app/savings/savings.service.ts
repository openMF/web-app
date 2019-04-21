/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Savings Service.
 */
@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  constructor(private http: HttpClient) { }
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
}
