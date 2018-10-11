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
   * @returns {Observable<any>} Fetches Codes.
   */
  getCodes(): Observable<any> {
    return this.http.get('/codes');
  }

}
