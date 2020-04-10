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
}
