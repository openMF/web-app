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
  getProvisioningCriterias(): Observable<any> {
    return this.http.get('/provisioningcriteria');
  }

  /**
   * @returns {Observable<any>} Loan Provisioning Criteria template.
   */
  getProvisioningCriteriaTemplate(): Observable<any> {
    return this.http.get('/provisioningcriteria/template');
  }

  /**
   * @param {string} provisioningId Provisioning ID of Loan Provisioning Criteria.
   * @returns {Observable<any>} Provisioning Criteria.
   */
  getProvisioningCriteria(provisioningId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/provisioningcriteria/${provisioningId}`, { params: httpParams });
  }

  /**
   * @param {string} provisioningId Provisioning ID of provisioning criteria to be deleted.
   * @returns {Observable<any>}
   */
  deleteProvisioningCriteria(criteriaId: string): Observable<any> {
    return this.http.delete(`/provisioningcriteria/${criteriaId}`);
  }

  /**
   * @returns {Observable<any>} Offices data
   */
  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * @param {string} officeId Office ID of Office.
   * @param {boolean} template
   * @returns {Observable<any>} Office.
   */
  getOffice(officeId: string, template: boolean = false): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/offices/${officeId}`, { params: httpParams });
  }

  /**
   * @param {any} office Office to be created.
   * @returns {Observable<any>}
   */
  createOffice(office: any): Observable<any> {
    return this.http.post('/offices', office);
  }

  /**
   * @param {any} office Office to be updated.
   * @param {string} officeId Office Id
   * @returns {Observable<any>}
   */
  updateOffice(officeId: string, office: any): Observable<any> {
    return this.http.put(`/offices/${officeId}`, office);
  }

 /**
  * @returns {Observable<any>}
  */
  getOfficeDatatables(): Observable<any> {
    const httpParams = new HttpParams().set('apptable', 'm_office');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  /**
   * @param officeId Office Id of office to get datatable for.
   * @param datatableName Data table name.
   * @returns {Observable<any>}
   */
  getOfficeDatatable(officeId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${officeId}`, { params: httpParams });
  }

  /**
   * @param officeId Office Id of office to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  addOfficeDatatableEntry(officeId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${officeId}`, data, { params: httpParams });
  }

  /**
   * @param officeId Office Id of office to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  editOfficeDatatableEntry(officeId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${officeId}`, data, { params: httpParams });
  }

  /**
   * @param officeId Office Id of office to get add datatable entry for.
   * @param datatableName Data Table name.
   * @returns {Observable<any>}
   */
  deleteDatatableContent(officeId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${officeId}`, { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Employees data
   */
  getEmployees(): Observable<any> {
    const httpParams = new HttpParams().set('status', 'all');
    return this.http.get('/staff', { params: httpParams });
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
   * @param {boolean} template
   * @returns {Observable<any>} Employee.
   */
  getEmployee(employeeId: string, template: boolean = true): Observable<any> {
    const httpParams = new HttpParams().set('template', template.toString());
    return this.http.get(`/staff/${employeeId}`, { params: httpParams });
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
   * @param {string} smsCampaignId SMS Campaign ID of SMS Campaign.
   * @returns {Observable<any>} SMS Campaign.
   */
  getSmsCampaign(smsCampaignId: string): Observable<any> {
    return this.http.get(`/smscampaigns/${smsCampaignId}`);
  }

  /**
   * @param {any} SMS
   * @returns {Observable<any>} Messages Data
   */
  getMessagebyStatus(SMS: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('status', SMS.status.toString())
      .set('locale', SMS.locale)
      .set('dateFormat', SMS.dateFormat);
    httpParams = SMS.fromDate ? httpParams.set('fromDate', SMS.fromDate) : httpParams;
    httpParams = SMS.toDate ? httpParams.set('toDate', SMS.toDate) : httpParams;
    return this.http.get(`/sms/${SMS.id}/messageByStatus`, { params: httpParams });
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
   * @returns {Observable<any>} Adhoc query Template data
   */
  getAdhocQueryTemplate(): Observable<any> {
    return this.http.get(`/adhocquery/template`);
  }

  /**
   * @param {any} adhocQuery Adhoc Query to be created.
   * @returns {Observable<any>}
   */
  createAdhocQuery(adhocQuery: any): Observable<any> {
    return this.http.post('/adhocquery', adhocQuery);
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
   * Get Cashier data.
   * @param {string} tellerId Teller ID of teller.
   * @param {string} cashierId Cashier ID of cashier
   * @returns {Observable<any>} Cashier data.
   */
  getCashier(tellerId: string, cashierId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}/cashiers/${cashierId}`);
  }

  /**
   * @param {string} tellerId Teller ID of teller to be deleted.
   * @returns {Observable<any>}
   */
  deleteTeller(tellerId: string): Observable<any> {
    return this.http.delete(`/tellers/${tellerId}`);
  }

  /**
   * @param {any} teller Teller to be created.
   * @returns {Observable<any>}
   */
  createTeller(teller: any): Observable<any> {
    return this.http.post('/tellers', teller);
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

  /**
   * @param {string} officeId Office ID of Holidays.
   * @returns {Observable<any>} Holidays data.
   */
  getHolidays(officeId: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('officeId', officeId.toString());
    return this.http.get('/holidays', { params: httpParams });
  }

  /**
   * Get Holiday data.
   * @param holidayId Holiday Id of holidays.
   * @returns {Observable<any>} Holiday data.
   */
  getHoliday(holidayId: string): Observable<any> {
    return this.http.get(`/holidays/${holidayId}`);
  }

  /**
   * Delete Holiday.
   * @param holidayId Holiday Id to be deleted.
   * @returns {Observable<any>} Resource Id.
   */
  deleteHoliday(holidayId: string) {
    return this.http.delete(`/holidays/${holidayId}`);
  }

  /**
   * @param {any} employeeId Employee ID of Employee to be edited.
   * @returns {Observable<any>}
   */
  updateEmployee(employeeId: string, employee: any): Observable<any> {
    return this.http.put(`/staff/${employeeId}`, employee);
  }

  /**
   * @param {string} tellerId Teller ID of Teller to be edited.
   * @returns {Observable<any>}
   */
  updateTeller(tellerId: string, teller: any): Observable<any> {
    return this.http.put(`/tellers/${tellerId}`, teller);
  }

}
