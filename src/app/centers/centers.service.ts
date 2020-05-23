/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Clients service.
 */
@Injectable({
    providedIn: 'root'
})
export class CentersService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} offset Page offset.
   * @param {number} limit Number of entries within the page.
   * @returns {Observable<any>} Centers.
   */
  getCenters(filterBy: any, orderBy: string, sortOrder: string, offset: number, limit: number): Observable<any> {
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy)
      .set('paged', 'true');
    // filterBy: name, externalId
    filterBy.forEach(function (filter: any) {
      if (filter.value) {
        console.log(filter.value);
        httpParams = httpParams.set(filter.type, filter.value);
      }
    });
    return this.http.get('/centers', { params: httpParams });
  }

    /**
     * @param {any} center Center to be created.
     * @returns {Observable<any>}
     */
    createCenter(center: any): Observable<any> {
        return this.http.post('/centers', center);
    }

    /**
     * @param {number} officeId Office Id of office to get staff for.
     * @returns {Observable<any>}
     */
    getStaff(officeId: number): Observable<any> {
        const httpParams = new HttpParams()
            .set('officeId', officeId.toString())
            .set('staffInSelectedOfficeOnly', 'true');
        return this.http.get('/centers/template', { params: httpParams });
    }

    /**
     * @param centerId CenterID
     * @returns {Observable<any>} Group Data for Center
     */
    getCenterData(centerId: string): Observable<any> {
      const httpParams = new HttpParams()
          .set('associations', 'groupMembers,collectionMeetingCalendar');
      return this.http.get(`/centers/${centerId}`, { params: httpParams } );
    }

    /**
     * @param centerId Center ID
     * @returns {Observable<any>} Returns the entire details of the Center ID
     */
    getCenterSummary(centerId: string): Observable<any> {
      const httpParams = new HttpParams().set('R_groupId', centerId)
        .set('genericResultSet', 'false');
      return this.http.get(`/runreports/GroupSummaryCounts`, { params: httpParams });
    }

    /**
     * @param centerId Center ID
     * @returns {Observable<any>} Returns the saving account for that center
     */
    getSavingsAccountDetails(centerId: string): Observable<any> {
      return this.http.get(`/centers/${centerId}/accounts`);
    }

    /**
     * @param centerId Center Id
     * @returns The notes for particular center
     */
    getCenterNotes(centerId: string): Observable<any> {
      return this.http.get(`/groups/${centerId}/notes`);
    }

    /**
     * Adds a note to the particular Center Id
     * @param centerId Center ID
     * @param noteData Note Data to be added
     * @returns {Observable<any>}
     */
    createCenterNote(centerId: string, noteData: any): Observable<any> {
      return this.http.post(`/groups/${centerId}/notes`, noteData);
    }

    /**
     * Edits the Center Note
     * @param centerId Center ID
     * @param noteId Note ID
     * @param noteData Note Data
     */
    editCenterNote(centerId: string, noteId: string, noteData: any) {
      return this.http.put(`/groups/${centerId}/notes/${noteId}`, noteData);
    }

    /**
     * Deletes the particular Note
     * @param centerId Center ID
     * @param noteId Note ID
     */
    deleteCenterNote(centerId: string, noteId: string) {
      return this.http.delete(`/groups/${centerId}/notes/${noteId}`);
    }

    /**
     * Get Center Datatables
     */
    getcenterDatatables() {
      const httpParams = new HttpParams().set('apptable', 'm_center');
    return this.http.get(`/datatables`, { params: httpParams });
    }

    /**
     * Get Center Datatable
     * @param centerId Center ID
     * @param datatableName Datatable Name
     */
    getCenterDatatable(centerId: string, datatableName: string) {
      const httpParams = new HttpParams().set('genericResultSet', 'true');
      return this.http.get(`/datatables/${datatableName}/${centerId}`, { params: httpParams });
    }

    /**
     * @param centerId Center Id of center to get add datatable entry for.
     * @param datatableName Data Table name.
     * @param data Data.
     * @returns {Observable<any>}
     */
    addCenterDatatableEntry(centerId: string, datatableName: string, data: any): Observable<any> {
      const httpParams = new HttpParams().set('genericResultSet', 'true');
      return this.http.post(`/datatables/${datatableName}/${centerId}`, data, { params: httpParams });
    }

    /**
     * @param centerId Center Id of center to get add datatable entry for.
     * @param datatableName Data Table name.
     * @param data Data.
     * @returns {Observable<any>}
     */
    editCenterDatatableEntry(centerId: string, datatableName: string, data: any): Observable<any> {
      const httpParams = new HttpParams().set('genericResultSet', 'true');
      return this.http.put(`/datatables/${datatableName}/${centerId}`, data, { params: httpParams });
    }

    /**
     * @param centerId Center Id of center to get add datatable entry for.
     * @param datatableName Data Table name.
     * @returns {Observable<any>}
     */
    deleteDatatableContent(centerId: string, datatableName: string): Observable<any> {
      const httpParams = new HttpParams().set('genericResultSet', 'true');
      return this.http.delete(`/datatables/${datatableName}/${centerId}`, { params: httpParams });
    }

}
