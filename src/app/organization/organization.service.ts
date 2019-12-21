/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Organization service.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Loan Provisioning Criteria data
   */
  getProvisioningCriteria(): Observable<any> {
    return this.http.get('/provisioningcriteria');
  }

  /**
   * @returns {Observable<any>} Offices data
   */
  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * @returns {Observable<any>} Employees data
   */
  getEmployees(): Observable<any> {
    return this.http.get('/staff');
  }

  /**
   * @returns {Observable<any>} Currencies data
   */
  getCurrencies(): Observable<any> {
    return this.http.get('/currencies');
  }

  /**
   * @returns {Observable<any>} SMS Campaigns data
   */
  getSmsCampaigns(): Observable<any> {
    return this.http.get('/smscampaigns');
  }

  /**
   * @returns {Observable<any>} Adhoc Queries data
   */
  getAdhocQueries(): Observable<any> {
    return this.http.get('/adhocquery');
  }

}
