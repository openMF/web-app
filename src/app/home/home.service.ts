/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Home Service
 */
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getCollectedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/Demand_Vs_Collection', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getDisbursedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/Disbursal_Vs_Awaitingdisbursal', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByDay', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByWeek', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByMonth', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByDay', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByWeek', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('R_officeId', officeId.toString())
        .set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByMonth', { params: httpParams });
  }

}
