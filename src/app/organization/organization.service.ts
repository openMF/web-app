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

  /**
   * @returns {Observable<any>} Tellers data
   */
  getTellers(): Observable<any> {
    return this.http.get('/tellers');
  }

  /**
   * @returns {Observable<any>} Payment Types data
   */
  getPaymentTypes(): Observable<any> {
    return this.http.get('/paymenttypes');
  }

  /**
   * @param {string} paymentTypeId Payment type ID of payment type to be deleted.
   * @returns {Observable<any>}
   */
  deletePaymentType(paymentTypeId: string): Observable<any> {
    return this.http.delete(`/paymenttypes/${paymentTypeId}`);
  }

  /**
   * @returns {Observable<any>} Password Preferences Template data
   */
  getPasswordPreferencesTemplate(): Observable<any> {
    return this.http.get('/passwordpreferences/template');
  }

  /**
   * @param {any} passwordPreferences Password Preferences data.
   * @returns {Observable<any>}
   */
  updatePasswordPreferences(passwordPreferences: any): Observable<any> {
    return this.http.put('/passwordpreferences', passwordPreferences);
  }

  /**
   * @param {number} offset Page offset.
   * @param {number} limit Number of entries within the page.
   * @returns {Observable<any>} Entity Data Table Checks data.
   */
  getEntityDataTableChecks(offset: number = 0, limit: number = -1): Observable<any> {
    const httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get('/entityDatatableChecks', { params: httpParams });
  }

  /**
   * @param {string} entityDataTableCheckId Entity Data Table Check ID of entity data table to be deleted.
   * @returns {Observable<any>}
   */
  deleteEntityDataTableCheck(entityDataTableCheckId: string): Observable<any> {
    return this.http.delete(`/entityDatatableChecks/${entityDataTableCheckId}`);
  }

}
