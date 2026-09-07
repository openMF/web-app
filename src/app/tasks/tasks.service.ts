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
 * Tasks Service
 */
@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);

  private buildHttpParams(paramsData?: any): HttpParams {
    let httpParams = new HttpParams();
    if (paramsData) {
      const propNames = Object.getOwnPropertyNames(paramsData);
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        if (!(paramsData[propName] === '' || paramsData[propName] === undefined || paramsData[propName] === null)) {
          httpParams = httpParams.set(propName, paramsData[propName]);
        }
      }
    }
    return httpParams;
  }

  /**
   * Get Maker Checker Data
   * @param {searchData} SearchData search the maker checker data.
   */
  getMakerCheckerData(searchData?: any): Observable<any> {
    return this.http.get('/makercheckers', { params: this.buildHttpParams(searchData) });
  }

  /**
   * Get Credit Applications Data.
   * @param {any} searchData Credit applications search and paging parameters.
   */
  getCreditApplications(searchData?: any): Observable<any> {
    return this.http.get('/v2/credit-applications', { params: this.buildHttpParams(searchData) });
  }

  /**
   * Get Maker Checker Template
   */
  getMakerCheckerTemplate(): Observable<any> {
    return this.http.get('/makercheckers/searchtemplate');
  }

  /**
   * Get Grouped Clients Data
   */
  getGroupedClientsData(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('status', 'pending');
    return this.http.get('/clients', { params: httpParams });
  }

  /**
   * Get all Offices Data
   */
  getAllOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * Get all loans to be approved
   */
  getAllLoansToBeApproved(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 'l.loan_status_id in (100,200)');
    return this.http.get('/loans', { params: httpParams });
  }

  /**
   * Get all loans to be disbursed
   */
  getAllLoansToBeDisbursed(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 'l.loan_status_id in (200)');
    return this.http.get('/loans', { params: httpParams });
  }

  /**
   * Get all savings accounts to be approved
   */
  getAllSavingsToBeApproved(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 's.status_enum in (100,200)');
    return this.http.get('/savingsaccounts', { params: httpParams });
  }

  /**
   * Get Loans Locked Data using pages and limit
   */
  getAllLoansLocked(page: number, limit: number): Observable<any> {
    const httpParams = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get('/loans/locked', { params: httpParams });
  }

  /**
   * Get Pending Rescheduled Loans
   */
  getPendingRescheduleLoans(): Observable<any> {
    const httpParams = new HttpParams().set('command', 'pending');
    return this.http.get('/rescheduleloans', { params: httpParams });
  }

  /**
   * Submit data in batches.
   * @param {data} Data to be submitted
   */
  submitBatchData(data: any): Observable<any> {
    return this.http.post('/batches', data);
  }

  /**
   * Execute Maker Checker Approve and Reject Action.
   * @param {makerCheckerId} MakerCheckerId
   * @param {command} Command
   */
  executeMakerCheckerAction(makerCheckerId: any, command: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/makercheckers/${makerCheckerId}`, {}, { params: httpParams });
  }

  /**
   * Execute Maker Checker Delete Action
   * @param {makerCheckerId} MakerCheckerId
   */
  deleteMakerChecker(makerCheckerId: any): Observable<any> {
    return this.http.delete(`/makercheckers/${makerCheckerId}`);
  }

  /**
   * Get Maker Checker Details.
   * @param {makerCheckerId} MakerCheckerId
   */
  getCheckerInboxDetail(makerCheckerId: any): Observable<any> {
    return this.http.get(`/audits/${makerCheckerId}`);
  }
}
