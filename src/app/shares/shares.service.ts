/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Shares Service
 */
@Injectable({
  providedIn: 'root'
})
export class SharesService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @param shareAccountId Share Account Id
   * @returns {Observable<any>} Share Account Details
   */
  getShareAccount(shareAccountId: any): Observable<any> {
    return this.http.get(`/accounts/share/${shareAccountId}`);
  }

}
