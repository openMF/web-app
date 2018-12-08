/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Products service.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @param {any} Fetches recurring deposit products.
   * @returns {Observable<any>}
   */
  getRecurringDepositProducts(): Observable<any> {
    return this.http.get('/recurringdepositproducts');
  }

}
