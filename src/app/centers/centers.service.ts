/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Centers service.
 */
@Injectable({
    providedIn: 'root'
  })

export class CentersService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
    constructor(private http: HttpClient) { }

    getCenters(): Observable<any> {
        return  this.http.get('/centers');
    }

}
