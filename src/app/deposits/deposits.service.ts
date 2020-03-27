/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Deposits service.
 */
@Injectable({
  providedIn: 'root'
})
export class DepositsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @param {string} chargeId Charge ID of charge.
   * @returns {Observable<any>} Charge.
   */
  getChargeTemplate(chargeId: string): Observable<any> {
    const params = { template: 'true' };
    return this.http.get(`/charges/${chargeId}`, { params: params });
  }

  /**
   * @param {string} params Params object having Client ID and Product ID.
   * @returns {Observable<any>} Fixed Deposit Account Template Data.
   */
  getFixedDepositAccountsTemplate(params: any): Observable<any> {
    return this.http.get('/fixeddepositaccounts/template/', { params: params });
  }

  /**
   * @param {any} params Params object having Fixed Deposit Account Data
   * @returns {Observable<any>}
   */
  createFixedDepositAccount(params: any): Observable<any> {
    return this.http.post('/fixeddepositaccounts/', params);
  }
}
