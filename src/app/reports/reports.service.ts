/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Reports service.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Reports data
   */
  getReports(): Observable<any> {
    return  this.http.get('/reports');
  }

}
