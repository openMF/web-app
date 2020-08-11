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
   * @param {any} criteriaData Provisioning Criteria to be created.
   * @returns {Observable<any>}
   */
  createProvisioningCriteria(criteriaData: any): Observable<any> {
    return this.http.post('/provisioningcriteria', criteriaData);
  }

  /**
   * @param {any} criteriaId Criteria Id
   * @param {any} criteriaData Provisioning Criteria to be created.
   * @returns {Observable<any>}
   */
  updateProvisioningCriteria(criteriaId: any, criteriaData: any): Observable<any> {
    return this.http.put(`/provisioningcriteria/${criteriaId}`, criteriaData);
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
   * Get Office Template.
   * @param {string} officeId Office Id of the office selected.
   * @returns {Observable<any>} Office Template.
   */
  getOfficeTemplate(officeId: string): Observable<any> {
    const httpParams = new HttpParams().set('officeId', officeId.toString());
    return this.http.get(`/loans/loanreassignment/template`, { params: httpParams });
  }

  /**
   * Get Officer Template.
   * @param officerId Officer Id.
   * @param officeId Office Id.
   */
  getOfficerTemplate(officerId: string, officeId: string): Observable<any> {
    const httpParams = new HttpParams()
                       .set('fromLoanOfficerId', officerId.toString())
                       .set('officeId', officerId.toString());
    return this.http.get('/loans/loanreassignment/template', { params: httpParams });
  }

  /**
   * Bulk Loan Reassignment.
   * @param loanData Load Data to be created.
   * @returns {Observable<any>}
   */
  createLoanReassignment(loanData: any): Observable<any> {
    return this.http.post('/loans/loanreassignment', loanData);
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
   * @param {any[]} currencies
   * @returns {Observable<any>} Currencies data
   */
  updateCurrencies(currencies: any[]): Observable<any> {
    return this.http.put('/currencies', {currencies});
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
  getSmsCampaign(campaignId: string): Observable<any> {
    return this.http.get(`/smscampaigns/${campaignId}`);
  }

  /**
   * @param {any} campaign Campaign to be created.
   * @returns {Observable<any>}
   */
  createSmsCampaign(campaign: any): Observable<any> {
    return this.http.post('/smscampaigns', campaign);
  }

  /**
   * @param {any} campaign Campaign to be updated.
   * @returns {Observable<any>}
   */
  updateSmsCampaign(campaign: any, campaignId: string): Observable<any> {
    return this.http.put(`/smscampaigns/${campaignId}`, campaign);
  }

  /**
   * @param {any} campaign Campaign to be deleted.
   * @returns {Observable<any>}
   */
  deleteSmsCampaign(campaignId: string): Observable<any> {
    return this.http.delete(`/smscampaigns/${campaignId}`);
  }

  /**
   * @returns {Observable<any>} SMS Campaign template
   */
  getSmsCampaignTemplate(): Observable<any> {
    return this.http.get('/smscampaigns/template');
  }

  /**
   * @param {string} campaignId Campaign Id
   * @param {any} data Data
   * @param {string} command Command
   * @returns {Observable<any>}
   */
  executeSmsCampaignCommand(campaignId: string, data: any, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command.toString());
    return this.http.post(`/smscampaigns/${campaignId}`, data, { params: httpParams });
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
   * @param {string} adhocQueryId Adhoc Query ID of adhoc query.
   * @returns {Observable<any>} Adhoc query and template.
   */
  getAdhocQueryAndTemplate(adhocQueryId: string): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/adhocquery/${adhocQueryId}`, { params: httpParams });
  }

  /**
   * @param {any} adhocQuery Adhoc Query to be created.
   * @returns {Observable<any>}
   */
  createAdhocQuery(adhocQuery: any): Observable<any> {
    return this.http.post('/adhocquery', adhocQuery);
  }

  /**
   * @param {any} queryId Query Id
   * @param {any} adhocQuery Adhoc Query to be created.
   * @returns {Observable<any>}
   */
  updateAdhocQuery(queryId: any, adhocQuery: any): Observable<any> {
    return this.http.put(`/adhocquery/${queryId}`, adhocQuery);
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
   * @param {string} tellerId Teller ID of teller.
   * @returns {Observable<any>} Cashier data.
   */
  getCashiers(tellerId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}/cashiers`);
  }

  /**
   * @param {string} tellerId Teller ID of teller.
   * @param {string} cashierId Cashier ID of cashier
   * @returns {Observable<any>} Cashier data.
   */
  getCashier(tellerId: string, cashierId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}/cashiers/${cashierId}`);
  }

  /**
   * @param {string} tellerId Teller Id
   * @param {string} cashierId Cashier Id
   * @param {string} currencyCode Currency Code
   * @returns {Observable<any>}
   */
  getCashierSummaryAndTransactions(tellerId: string, cashierId: string, currencyCode: string): Observable<any> {
    const httpParams = new HttpParams().set('currencyCode', currencyCode);
    return this.http.get(`/tellers/${tellerId}/cashiers/${cashierId}/summaryandtransactions`, { params: httpParams });
  }

  /**
   * Get Cashier Transaction template.
   * @param {string} tellerId Teller Id.
   * @param {string} cashierId Cashier Id.
   * @returns {Observable<any>} Cashier Transaction data.
   */
  getCashierTransactionTemplate(tellerId: string, cashierId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}/cashiers/${cashierId}/transactions/template`);
  }

  /**
   * @param {string} tellerId Teller Id
   * @param {any} cashier Cashier
   * @returns {Observable<any>}
   */
  createCashier(tellerId: string, cashier: any): Observable<any> {
    return this.http.post(`/tellers/${tellerId}/cashiers`, cashier);
  }

  /**
   * @param {string} tellerId Teller ID of teller.
   * @param {string} cashierId Cashier ID of cashier
   * @returns {Observable<any>}
   */
  deleteCashier(tellerId: string, cashierId: string): Observable<any> {
    return this.http.delete(`/tellers/${tellerId}/cashiers/${cashierId}`);
  }

  /**
   * @param {string} tellerId Teller Id.
   * @param {string} cashierId Cashier Id.
   * @param {string} cashData Cash Data.
   * @returns {Observable<any>}
   */
  settleCash(tellerId: string, cashierId: string, cashData: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'settle');
    return this.http.post(`/tellers/${tellerId}/cashiers/${cashierId}/settle`, cashData, {params: httpParams});
  }

  /**
   * @param {string} tellerId Teller Id.
   * @param {string} cashierId Cashier Id.
   * @param {string} cashData Cash Data.
   * @returns {Observable<any>}
   */
  allocateCash(tellerId: string, cashierId: string, cashData: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'allocate');
    return this.http.post(`/tellers/${tellerId}/cashiers/${cashierId}/allocate`, cashData, {params: httpParams});
  }

  /** Get Cashier Template.
   * @param tellerId Teller ID.
   * @returns {Observable<any>} Cashier template.
   */
  getCashierTemplate(tellerId: string): Observable<any> {
    return this.http.get(`/tellers/${tellerId}/cashiers/template`);
  }

  /**
   * Update Cashier.
   * @param tellerId Teller Id.
   * @param cashierId Cashier Id.
   * @param cashierData Cashier data to be updated.
   * @returns {Observable<any>}
   */
  updateCashier(tellerId: string, cashierId: string, cashierData: any): Observable<any> {
    return this.http.put(`/tellers/${tellerId}/cashiers/${cashierId}`, cashierData);
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
   * Get Entity Data Table Checks Template.
   */
  getEntityDataTableChecksTemplate(): Observable<any> {
    return this.http.get('/entityDatatableChecks/template');
  }

  /**
   * Create Entity Data Table Checks.
   * @param entityData Data to be passed.
   */
  createEntityDataTableChecks(entityData: any): Observable<any> {
    return this.http.post('/entityDatatableChecks', entityData);
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
   * Get Holiday template.
   * @returns {Observable<any>} Holiday data.
   */
  getHolidayTemplate(): Observable<any> {
    return this.http.get('/holidays/template');
  }

  /**
   * Create Holiday.
   * @param holidayData Holiday data to be created.
   * @returns {Observable<any>}
   */
  createHoliday(holidayData: any): Observable<any> {
    return this.http.post('/holidays', holidayData);
  }

  /**
   * Update Holiday.
   * @param holidayId Holiday Id to be updated.
   * @param holidayData Holiday data to be updated.
   * @returns {Observable<any>}
   */
  updateHoliday(holidayId: any, holidayData: any): Observable<any> {
    return this.http.put(`/holidays/${holidayId}`, holidayData);
  }

  /**
   * Delete Holiday.
   * @param holidayId Holiday Id to be deleted.
   * @returns {Observable<any>} Resource Id.
   */
  deleteHoliday(holidayId: string): Observable<any> {
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

  /**
   * @returns {Observable<any>} Funds data
   */
  getFunds(): Observable<any> {
    return this.http.get('/funds');
  }

  /**
   * @param {any} fund Fund to be created.
   * @returns {Observable<any>}
   */
  createFund(fund: any): Observable<any> {
    return this.http.post('/funds', fund);
  }

  /**
   * @param {string} fundId Fund Id
   * @param {any} fundData Fund Data
   * @returns {Observable<any>}
   */
  editFund(fundId: string, fundData: any): Observable<any> {
    return this.http.put(`/funds/${fundId}`, fundData);
  }

  /*
   * @param {any} officeId ID of office to retrieve staff from.
   * @returns {Observable<any>} Staff data.
   */
  getStaff(officeId: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('officeId', officeId.toString());
    return this.http.get('/staff', { params: httpParams });
  }

  /**
   * @param {string} entity Entity to get imports data for.
   * @returns {Observable<any>} Imports data.
   */
  getImports(entity: string): Observable<any> {
    const httpParams = new HttpParams().set('entityType', entity);
    return this.http.get('/imports', { params: httpParams } );
  }

  /**
   * @returns {Observable<any>}
   */
  getAdvanceSearchTemplate(): Observable<any> {
    return this.http.get('/search/template');
  }

  /**
   * @returns {Observable<any>}
   */
  retrieveAdvanceSearchResults(queryObject: any): Observable<any> {
    return this.http.post('/search/advance', queryObject);
  }

  /**
   * @returns {Observable<any>}
   */
  getStandingInstructionTemplate(): Observable<any> {
    return this.http.get('/standinginstructions/template');
  }

  /**
   * @param {any} instruction
   * @returns {Observable<any>} Standing Instructions
   */
  getStandingInstructions(instruction: any): Observable<any> {
    let httpParams = new HttpParams();
    for (const key in instruction) {
      if (instruction[key] !== '' && instruction[key] !== null) {
        httpParams = httpParams.set(key, instruction[key]);
      }
    }
    return this.http.get(`/standinginstructionrunhistory`, { params: httpParams });
  }

  /**
   * @param urlSuffix of Bulk-Import
   * @param officeId Office ID for template retrieval
   * @param staffId Staff ID for template retrieval
   * @param legalFormType Legal Form type fortemplate retrieval
   * @returns {Observable<any>} Import Template
   */
  getImportTemplate(urlSuffix: string, officeId: any, staffId: any, legalFormType: string): Observable<any> {
    let httpParams = new HttpParams()
      .set('tenantIdentifier', 'default')
      .set('locale', 'en')
      .set('dateFormat', 'dd MMMM yyyy');
    if (officeId) {
      httpParams = httpParams.set('officeId', officeId.toString());
    }
    if (staffId) {
      httpParams = httpParams.set('staffId', staffId.toString());
    }
    if (legalFormType.length) {
      httpParams = httpParams.set('legalFormType', legalFormType);
    }
    return this.http.get(`${urlSuffix}/downloadtemplate`, { params: httpParams, responseType: 'arraybuffer', observe: 'response'} );
  }

  /**
   * @param {any} id Import ID for document retrieval
   * @returns {Observable<any>} Import Document
   */
  getImportDocument(id: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('importDocumentId', id)
      .set('tenantIdentifier', 'default' );
    return this.http.get('/imports/downloadOutputTemplate', { params: httpParams, responseType: 'arraybuffer', observe: 'response'});
  }

  /**
   * @param {File} file File to be uploaded
   * @param {string} urlSuffix URL suffix
   * @param {string} legalFormType Legal Form type for file upload
   * @returns {Observable<any>}
   */
  uploadImportDocument(file: File, urlSuffix: string, legalFormType: string): Observable<any> {
    let httpParams = new HttpParams();
    if (legalFormType.length) {
      httpParams = httpParams.set('legalFormType', legalFormType);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('locale', 'en');
    formData.append('datefFormat', 'dd MMMM yyyy');
    return this.http.post(`${urlSuffix}/uploadtemplate`, formData , { params: httpParams } );
  }

}
