/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Base Teller service.
 */
@Injectable({
  providedIn: 'root'
})
export class BaseTellerService {
  private http = inject(HttpClient);

  private readonly savingsAccountOpeningsPath = '/v2/base-teller/savings-account-openings';

  /**
   * Searches customers through the Base Teller savings-opening workflow API.
   */
  searchSavingsOpeningCustomers(searchTerm: string, limit: number = 20): Observable<any> {
    const params = new HttpParams().set('q', searchTerm).set('limit', String(limit));
    return this.http.get(`${this.savingsAccountOpeningsPath}/customers`, { params });
  }

  /**
   * Retrieves customer position/details for the Base Teller savings-opening workflow.
   */
  getSavingsOpeningCustomerPosition(clientId: string | number): Observable<any> {
    return this.http.get(`${this.savingsAccountOpeningsPath}/customers/${clientId}/position`);
  }

  /**
   * Retrieves eligible savings products.
   */
  getSavingsOpeningProducts(currencyCode?: string): Observable<any> {
    let params = new HttpParams();
    if (currencyCode) {
      params = params.set('currencyCode', currencyCode);
    }
    return this.http.get(`${this.savingsAccountOpeningsPath}/products`, { params });
  }

  /**
   * Opens and initially funds a savings account through the merged Base Teller workflow endpoint.
   */
  createSavingsAccountOpening(payload: any): Observable<any> {
    return this.http.post(this.savingsAccountOpeningsPath, payload);
  }

  /**
   * Retrieves an authoritative receipt when the backend exposes it separately.
   */
  getSavingsOpeningReceipt(receiptNumber: string | number): Observable<any> {
    return this.http.get(`${this.savingsAccountOpeningsPath}/${receiptNumber}`);
  }
}
