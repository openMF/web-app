/** Angular Imports */
import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) { }

  /**
   * Returns all the offices
   */
  getOffices(): Observable<any> {
    return this.http.get(`/offices`);
  }

  /**
   * Returns the loan officer(staffs) for the particular office
   * @param {officeId} OfficeId any
   */
  getStaffs(officeId: any): Observable<any> {
    const httpParams = new HttpParams()
                      .set('officeId', officeId)
                      .set('status', 'all');
    return this.http.get(`/staff`, { params: httpParams });
  }

  /**
   * Retrieves the Collection Sheet Data
   * @param {data} data any
   */
  retrieveCollectionSheetData(data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'generateCollectionSheet');
    return this.http.post(`/collectionsheet`, data, { params: httpParams });
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
