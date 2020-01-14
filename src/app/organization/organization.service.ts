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
   * @param {any} office Office to be created.
   * @returns {Observable<any>}
   */
  createOffice(office: any): Observable<any> {
    return this.http.post('/offices', office);
  }

  /**
   * @returns {Observable<any>} Employees data
   */
  getEmployees(): Observable<any> {
    return this.http.get('/staff');
  }

  /**
   * @param {any} employee Employee to be created.
   * @returns {Observable<any>}
   */
  createEmployee(employee: any): Observable<any> {
    return this.http.post('/staff', employee);
  }

  /**
   * @param {string} employeeId Employee ID of employee.
   * @returns {Observable<any>} Employee.
   */
  getEmployee(employeeId: string): Observable<any> {
    return this.http.get(`/staff/${employeeId}`);
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
   * @param {string} adhocQueryId Adhoc Query ID of adhoc query.
   * @returns {Observable<any>} Adhoc query.
   */
  getAdhocQuery(adhocQueryId: string): Observable<any> {
    return this.http.get(`/adhocquery/${adhocQueryId}`);
  }

  /**
   * @param {string} adhocQueryId Adhoc Query ID of adhoc query to be deleted.
   * @returns {Observable<any>}
   */
  deleteAdhocQuery(adhocQueryId: string): Observable<any> {
    return this.http.delete(`/adhocquery/${adhocQueryId}`);
  }

  /**
   * @returns {Observable<any>} Tellers data
   */
  getTellers(): Observable<any> {
    return this.http.get('/tellers');
  }

  /**
   * @param {string} tellerId Teller ID of teller.
   * @returns {Observable<any>} Teller.
   */
  getTeller(tellerId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}`);
  }

  /**
   * @param {string} tellerId Teller ID of teller to be deleted.
   * @returns {Observable<any>}
   */
  deleteTeller(tellerId: string): Observable<any> {
    return this.http.delete(`/tellers/${tellerId}`);
  }

  /**
   * @returns {Observable<any>} Payment Types data
   */
  getPaymentTypes(): Observable<any> {
    return this.http.get('/paymenttypes');
  }

  /**
   * @param {any} paymentType Payment type to be created.
   * @returns {Observable<any>}
   */
  createPaymentType(paymentType: any): Observable<any> {
    return this.http.post('/paymenttypes', paymentType);
  }

  /**
   * @param {string} paymentTypeId Payment type ID of payment type to be deleted.
   * @returns {Observable<any>}
   */
  deletePaymentType(paymentTypeId: string): Observable<any> {
    return this.http.delete(`/paymenttypes/${paymentTypeId}`);
  }

  /**
   * @param {string} paymentTypeId Payment type ID of payment type.
   * @returns {Observable<any>} Payment type.
   */
  getPaymentType(paymentTypeId: string): Observable<any> {
    return this.http.get(`/paymenttypes/${paymentTypeId}`);
  }

  /**
   * @param {string} paymentTypeId Payment type ID of Payment Type to be edited.
   * @returns {Observable<any>}
   */
  updatePaymentType(paymentTypeId: string, paymentType: any): Observable<any> {
    return this.http.put(`/paymenttypes/${paymentTypeId}`, paymentType);
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

  /**
   * @returns {Observable<any>} Working days data.
   */
  getWorkingDays(): Observable<any> {
    return this.http.get('/workingdays');
  }

  /**
   * @param {any} workingDays Working days data.
   * @returns {Observable<any>}
   */
  updateWorkingDays(workingDays: any): Observable<any> {
    return this.http.put('/workingdays', workingDays);
  }

}
