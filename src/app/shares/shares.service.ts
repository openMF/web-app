/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Shares Service.
 */
@Injectable({
  providedIn: 'root'
})
export class SharesService {

  /**
   * @param {HttpClient} http Http Client
   */
  constructor(private http: HttpClient) {}

  /**
   * @param {string} accountId Shares Account Id of account to get data for.
   * @param {boolean} template Shares account template required?.
   * @returns {Observable<any>} Shares data.
   */
  getSharesAccountData(accountId: string, template: boolean): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/accounts/share/${accountId}`, { params: httpParams });
  }

  /**
   * @param {string} clientId Client Id assosciated with shares account.
   * @param {string} productId Product Id
   * @returns {Observable<any>} Shares account template.
   */
  getSharesAccountTemplate(clientId: string, productId?: string): Observable<any> {
    let httpParams = new HttpParams().set('clientId', clientId);
    httpParams = productId ? httpParams.set('productId', productId) : httpParams;
    return this.http.get('/accounts/share/template', { params: httpParams });
  }

  /**
   * @param {any} sharesAccount Shares Account
   * @returns {Observable<any>}
   */
  createSharesAccount(sharesAccount: any): Observable<any> {
    return this.http.post('/accounts/share', sharesAccount);
  }

  /**
   * @param {string} accountId: Shares account Id.
   * @param {any} sharesAccount Shares Account
   * @returns {Observable<any>}
   */
  updateSharesAccount(accountId: string, sharesAccount: any): Observable<any> {
    return this.http.put(`/accounts/share/${accountId}`, sharesAccount);
  }

  /**
   * @param {string} accountId shares account Id
   * @returns {Observable<any>}
   */
  deleteSharesAccount(accountId: string): Observable<any> {
    return this.http.delete(`/accounts/share/${accountId}`);
  }

  /**
   * @param {string} accountId Shares Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>} Shares data.
   */
  executeSharesAccountCommand(accountId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/accounts/share/${accountId}`, data, { params: httpParams });
  }

}
