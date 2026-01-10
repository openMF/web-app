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
 * Collections Service
 */
@Injectable({
  providedIn: 'root'
})
export class CollectionsService {
  private http = inject(HttpClient);

  /**
   * Retrieves the Collection Sheet Data
   * @param {data} data any
   */
  retrieveCollectionSheetData(data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'generateCollectionSheet');
    return this.http.post(`/collectionsheet`, data, { params: httpParams });
  }

  generateCollectionSheetData(centerId: number, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'generateCollectionSheet');
    return this.http.post(`/centers/${centerId}`, data, { params: httpParams });
  }

  /**
   * Executes the Save Collection Sheet Data
   * @param {data} data any
   */
  executeSaveCollectionSheet(data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'saveCollectionSheet');
    return this.http.post(`/collectionsheet`, data, { params: httpParams });
  }
}
