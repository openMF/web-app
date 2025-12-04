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
