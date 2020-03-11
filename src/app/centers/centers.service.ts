import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })


export class CentersService {
    constructor(private http: HttpClient) { }

    getCenters(): Observable<any> {
        return  this.http.get('/centers');
    }

  /**
   * @param {any} collectionSheet Collection sheet to be created.
   * @returns {Observable<any>}
   */
    generateIndividualCollectionSheet(collectionSheet: any): Observable<any> {
        return  this.http.post('/generateCollectionSheet', collectionSheet);
    }

   /**
    * @param {any} collectionSheetData Collection sheet data to be saved.
    * @returns {Observable<any>}
    */
   saveCollectionSheet(collectionSheetData: any): Observable<any> {
    return  this.http.post('/saveCollectionSheet', collectionSheetData);
   }

}
