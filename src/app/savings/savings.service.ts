/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Savings service.
 */
@Injectable({
  providedIn: 'root'
})
export class SavingsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Savings application data
   */
  createSavingsAccount(savingsApplication: any): Observable<any> {
    return this.http.post('/savingsaccounts', savingsApplication);
  }
}
