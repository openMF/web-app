/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * System service.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Data tables.
   */
  getDataTables(): Observable<any> {
    return this.http.get('/datatables');
  }

  /**
   * @returns {Observable<any>} Hooks.
   */
  getHooks(): Observable<any> {
    return this.http.get('/hooks');
  }

  /**
   * @returns {Observable<any>} Fetches Roles and Permissions
   */
  getRoles(): Observable<any> {
    return this.http.get('/roles');
  }

  /**
   * @returns {Observable<any>} Fetches Codes.
   */
  getCodes(): Observable<any> {
    return this.http.get('/codes');
  }

  /**
   * @returns {Observable<any>} Fetches Surveys.
   */
  getSurveys(): Observable<any> {
    return this.http.get('/surveys');
  }

  /**
   * @returns {Observable<any>} Fetches Jobs.
   */
  getJobs(): Observable<any> {
    return this.http.get('/jobs');
  }

  /**
   * @returns {Observable<any>} Fetches Scheduler.
   */
  getScheduler(): Observable<any> {
    return this.http.get('/scheduler');
  }

  /**
   * @param {any} code Code to be created.
   * @returns {Observable<any>}
   */
  createCode(code: any): Observable<any> {
    return this.http.post('/codes', code);
  }

}
