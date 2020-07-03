/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * RecurringDeposits Service.
 */
@Injectable({
  providedIn: 'root'
})
export class RecurringDepositsService {

  constructor(private http: HttpClient) {}

  /**
   * @param {string} recurringDepositAccountId is recurringDeposit account's Id.
   * @returns {Observable<any>}
   */
  // getRecurringDepositsTransactionTemplateResource(recurringDepositAccountId: string): Observable<any> {
  //   return this.http.get(`/recurringDepositsaccounts/${recurringDepositAccountId}/transactions/template`);
  // }

  getRecurringDepositsAccountData(recurringDepositAccountId: any) {
    const httpParams = new HttpParams()
      .set('associations', 'all');
    return this.http.get(`/recurringdepositaccounts/${recurringDepositAccountId}`, { params: httpParams });
  }

}
