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

  constructor(private http: HttpClient) {}

  /**
   * @param accountId Shares Account Id of account to get data for.
   * @returns {Observable<any>} Shares data.
   */
  getSharesAccountData(accountId: string): Observable<any> {
    return this.http.get(`/accounts/share/${accountId}`);
  }

}
