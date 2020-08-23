/** Angular Imports */
import { Injectable } from '@angular/core';
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

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Get Maker Checker Data
   * @param {searchData} SearchData search the maker checker data.
   */
  getMakerCheckerData(searchData?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (searchData) {
      const propNames = Object.getOwnPropertyNames(searchData);
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        if (!(searchData[propName] === '' || searchData[propName] === undefined || searchData[propName] === null)) {
          httpParams = httpParams.set(propName, searchData[propName]);
        }
      }
    }
    return this.http.get('/makercheckers', { params: httpParams });
  }

  /**
   * Get Maker Checker Template
   */
  getMakerCheckerTemplate(): Observable<any> {
    return this.http.get('/makercheckers');
  }

  /**
   * Get Grouped Clients Data
   */
  getGroupedClientsData(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000')
                                       .set('sqlSearch', 'c.status_enum=100');
    return this.http.get('/clients', { params: httpParams});
  }

  /**
   * Get all Offices Data
   */
  getAllOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * Get all Loans Data
   */
  getAllLoans(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000')
                                       .set('sqlSearch', 'l.loan_status_id in (100,200)');
    return this.http.get('/loans', { params: httpParams });
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
