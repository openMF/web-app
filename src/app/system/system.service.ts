/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * System service.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Data tables.
   */
  getDataTables(): Observable<any> {
    return this.http.get('/datatables');
  }

  /**
   * @returns {Observable<any>} Hooks.
   */
  getHooks(): Observable<any> {
    return this.http.get('/hooks');
  }

  /**
   * @param {string} hookId Hook ID of Hook.
   * @returns {Observable<any>}
   */
  getHook(hookId: string): Observable<any> {
    return this.http.get(`/hooks/${hookId}`);
  }

  /**
   * @returns {Observable<any>} Hooks Template.
   */
  getHooksTemplate(): Observable<any> {
    return this.http.get('/hooks/template');
  }

  /**
   * @param {any} hook Hook to be created.
   * @returns {Observable<any>}
   */
  createHook(hook: any): Observable<any> {
    return this.http.post('/hooks', hook);
  }

  /**
   * @param {string} hookId Hook ID of Hook to be updated.
   * @param {any} hook Hook to be updated.
   * @returns {Observable<any>}
   */
  updateHook(hookId: string, hook: any): Observable<any> {
    return this.http.put(`/hooks/${hookId}`, hook);
  }

  /**
   * @param {string} hookId Hook ID of Hook to be deleted.
   * @returns {Observable<any>}
   */
  deleteHook(hookId: string): Observable<any> {
    return this.http.delete(`/hooks/${hookId}`);
  }

  /**
   * @returns {Observable<any>} Fetches Roles and Permissions
   */
  getRoles(): Observable<any> {
    return this.http.get('/roles');
  }

  /**
   * @returns {Observable<any>} Fetches Roles and Permissions
   */
  getRole(roleId: any): Observable<any> {
    return this.http.get(`/roles/${roleId}/permissions`);
  }

  /**
   * @param role Role.
   * @param roleId Role ID.
   * @returns {Observable<any>}
   */
  updateRole(role: any, roleId: string): Observable<any> {
    return this.http.put(`/roles/${roleId}`, role);
  }

  /**
   * @param roleID Role ID.
   * @param roleValueChanges Role value changes.
   * @returns {Observable<any>}
   */
  updateRolePermission(roleId: any, roleValueChanges: any): Observable<any> {
    return this.http.put(`/roles/${roleId}/permissions`, roleValueChanges);
  }

  /**
   * @param roleId Role ID.
   * @returns {Observable<any>}
   */
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`/roles/${roleId}`);
  }

  /**
   * @param {any} role Role to be created.
   * @returns {Observable<any>}
   */
  createRole(role: any): Observable<any> {
    return this.http.post('/roles', role);
  }

  /**
   * @param roleId Role ID.
   * @returns {Observable<any>}
   */
  enableRole(roleId: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'enable');
    return this.http.post(`/roles/${roleId}`, {} , { params: httpParams });
  }

  /**
   * @param roleId Role ID.
   * @returns {Observable<any>}
   */
  disableRole(roleId: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'disable');
    return this.http.post(`/roles/${roleId}`, {}, { params: httpParams });
  }

  /**
   * @returns {Observable<any>} Fetches Codes.
   */
  getCodes(): Observable<any> {
    return this.http.get('/codes');
  }

  /**
   * @param codeId Code ID.
   * @returns {Observable<any>} Fetches Code.
   */
  getCode(codeId: string): Observable<any> {
    return this.http.get(`/codes/${codeId}`);
  }

  /**
   * @param code Code.
   * @param codeId Code ID.
   * @returns {Observable<any>}
   */
  updateCode(code: any, codeId: string): Observable<any> {
    return this.http.put(`/codes/${codeId}`, code);
  }

  /**
   * @param codeId Code ID.
   * @returns {Observable<any>} Code Values.
   */
  getCodeValues(codeId: string): Observable<any> {
    return this.http.get(`/codes/${codeId}/codevalues`);
  }

  /**
   * @param codeId Code ID.
   * @param codeValueId Code value ID.
   * @returns {Observable<any>}
   */
  deleteCodeValue(codeId: string, codeValueId: string): Observable<any> {
    return this.http.delete(`/codes/${codeId}/codevalues/${codeValueId}`);
  }

  /**
   * @param codeId Code ID.
   * @param codeValueId Code value ID.
   * @param codeValueChanges Code value changes.
   * @returns {Observable<any>}
   */
  updateCodeValue(codeId: string, codeValueId: string, codeValueChanges: any): Observable<any> {
    return this.http.put(`/codes/${codeId}/codevalues/${codeValueId}`, codeValueChanges);
  }

  /**
   * @param codeId Code ID.
   * @param codeValueId Code value.
   * @returns {Observable<any>}
   */
  createCodeValue(codeId: string, codeValue: any): Observable<any> {
    return this.http.post(`/codes/${codeId}/codevalues`, codeValue);
  }

  /**
   * @param codeId Code ID.
   * @returns {Observable<any>}
   */
  deleteCode(codeId: string): Observable<any> {
    return this.http.delete(`/codes/${codeId}`);
  }

  /**
   * @returns {Observable<any>} Fetches Surveys.
   */
  getSurveys(): Observable<any> {
    return this.http.get('/surveys');
  }

  /**
   * @param {any} survey Survey to be created.
   * @returns {Observable<any>}
   */
  createSurvey(survey: any): Observable<any> {
    return this.http.post('/surveys', survey);
  }

  /**
   * @returns {Observable<any>} Fetches Jobs.
   */
  getJobs(): Observable<any> {
    return this.http.get('/jobs');
  }

  /**
   * @returns {Observable<any>} Fetches Scheduler.
   */
  getScheduler(): Observable<any> {
    return this.http.get('/scheduler');
  }

  /**
   * @param jobId Job Id to be edited
   * @returns {Observable<any>} Fetches Scheduler Job.
   */
  getSelectedJob(jobId: string): Observable<any> {
    return this.http.get(`/jobs/${jobId}`);
  }

  /**
   * @param {string} jobId Job ID of Job to be updated.
   * @param {any} Job Job to be updated.
   * @returns {Observable<any>}
   */
  updateScheduler(jobId: string, job: any): Observable<any> {
    return this.http.put(`/jobs/${jobId}`, job);
  }

  /*
   * @param jobId Job Id to view the history.
   * @returns {Observable<any>} Fetches History of the Job.
   */
  getHistoryScheduler(jobId: string): Observable<any> {
    return this.http.get(`/jobs/${jobId}/runhistory`);
  }

  /**
   * @param {any} code Code to be created.
   * @returns {Observable<any>}
   */
  createCode(code: any): Observable<any> {
    return this.http.post('/codes', code);
  }

  /**
   * @param {any} dataTable Data Table to be created.
   * @return {Observable<any>}
   */
  createDataTable(dataTable: any): Observable<any> {
    return this.http.post('/datatables', dataTable);
  }

  /**
   * @param dataTableName Data Table Name.
   * @return {Observable<any>}
   */
  getDataTable(dataTableName: string): Observable<any> {
    return this.http.get(`/datatables/${dataTableName}`);
  }

  /**
   * @param dataTableName Data Table Name.
   * @return {Observable<any>}
   */
  deleteDataTable(dataTableName: string): Observable<any> {
    return this.http.delete(`/datatables/${dataTableName}`);
  }

  /**
   * @param dataTable Data Table.
   * @param dataTableName Data Table Name.
   * @return {Observable<any>}
   */
  updateDataTable(dataTable: any, dataTableName: string): Observable<any> {
    return this.http.put(`/datatables/${dataTableName}`, dataTable);
  }

  /**
   * @returns {Observable<any>} Configurations data.
   */
  getConfigurations(): Observable<any> {
    return this.http.get('/configurations');
  }

  /**
   * @param {string} configurationId Configuration ID of configuration.
   * @returns {Observable<any>} Configuration.
   */
  getConfiguration(configurationId: string): Observable<any> {
    return this.http.get(`/configurations/${configurationId}`);
  }

  /**
   * @param {string} configurationId Configuration ID of configuration to be updated.
   * @param {any} configuration Configuration to be updated.
   * @returns {Observable<any>}
   */
  updateConfiguration(configurationId: string, configuration: any): Observable<any> {
    return this.http.put(`/configurations/${configurationId}`, configuration);
  }

  /**
   * @param {string} externalConfigurationName External Configuration Name.
   * @returns {Observable<any>} External Configuration.
   */
  getExternalConfiguration(externalConfigurationName: string): Observable<any> {
    return this.http.get(`/externalservice/${externalConfigurationName}`);
  }

  /**
   * @param {string} externalConfigurationName External Configuration Name.
   * @param {any} externalConfiguration External Configuration.
   * @returns {Observable<any>}
   */
  updateExternalConfiguration(externalConfigurationName: string, externalConfiguration: any): Observable<any> {
    return this.http.put(`/externalservice/${externalConfigurationName}`, externalConfiguration);
  }

  /**
   * @returns {Observable<any>} Account number preferences.
   */
  getAccountNumberPreferences(): Observable<any> {
    return this.http.get('/accountnumberformats');
  }

  /**
   * @returns {Observable<any>} Fetches Account Number Preferences Template.
   */
  getAccountNumberPreferencesTemplate(): Observable<any> {
    return this.http.get('/accountnumberformats/template');
  }

  /**
   * @param {string} accountNumberPreferenceId Account Number Preference ID.
   * @returns {Observable<any>} Fetches Account Number Preference.
   */
  getAccountNumberPreference(accountNumberPreferenceId: string): Observable<any> {
    return this.http.get(`/accountnumberformats/${accountNumberPreferenceId}`);
  }

  /**
   * @param accountNumberPreference Account Number Preference.
   * @returns {Observable<any>}
   */
  createAccountNumberPreference(accountNumberPreference: any): Observable<any> {
    return this.http.post('/accountnumberformats', accountNumberPreference);
  }

  /**
   * @param {string} accountNumberPreferenceId Account Number Preference ID.
   * @returns {Observable<any>}
   */
  deleteAccountNumberPreference(accountNumberPreferenceId: string): Observable<any> {
    return this.http.delete(`/accountnumberformats/${accountNumberPreferenceId}`);
  }

  /**
   * @param {string} accountNumberPreferenceId Account Number Preference ID.
   * @param {any} accountNumberPreferenceChanges Changes in Account Number Preference.
   * @returns {Observable<any>}
   */
  updateAccountNumberPreference(accountNumberPreferenceId: string, accountNumberPreferenceChanges: any): Observable<any> {
    return this.http.put(`/accountnumberformats/${accountNumberPreferenceId}`, accountNumberPreferenceChanges);
  }

  /**
   * @returns {Observable<any>} Reports.
   */
  getReports(): Observable<any> {
    return this.http.get('/reports');
  }

  /**
   * @param {string} reportId Report ID.
   * @returns {Observable<any>} Report.
   */
  getReport(reportId: string): Observable<any> {
    return this.http.get(`/reports/${reportId}?template=true`);
  }

  /**
   * @returns {Observable<any>} Report Template.
   */
  getReportTemplate(): Observable<any> {
    return this.http.get('/reports/template');
  }

  /**
   * @param {any} report Report.
   * @returns {Observable<any>}
   */
  createReport(report: any): Observable<any> {
    return this.http.post('/reports', report);
  }

  /**
   * @param {string} reportId Report ID.
   * @param {any} report Report.
   * @returns {Observable<any>}
   */
  updateReport(reportId: string, report: any): Observable<any> {
    return this.http.put(`/reports/${reportId}`, report);
  }

  /**
   * @param {string} reportId Report ID.
   * @returns {Observable<any>}
   */
  deleteReport(reportId: string): Observable<any> {
    return this.http.delete(`/reports/${reportId}`);
  }

  /**
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} offset Page offset.
   * @param {number} limit Number of entries within the page.
   * @returns {Observable<any>} Audit Trails.
   */
  getAuditTrails(filterBy: any, orderBy: string, sortOrder: string, offset: number, limit: number): Observable<any> {
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy)
      .set('paged', 'true');
    // filterBy: actionName, entityName, resourceId, makerId, makerDateTimeFrom, makerDateTimeTo, checkerId, checkerDateTimeFrom, checkerDateTimeTo, processingResult
    filterBy.forEach(function (filter: any) {
      if (filter.value !== '') {
        httpParams = httpParams.set(filter.type, filter.value);
      }
    });
    return this.http.get('/audits', { params: httpParams });
  }

  /**
   * @param {string} auditTrailId Audit Trail ID.
   * @returns {Observable<any>}
   */
  getAuditTrail(auditTrailId: string): Observable<any> {
    return this.http.get(`/audits/${auditTrailId}`);
  }

  /**
   * @returns {Observable<any>} Audit Trail Search Template.
   */
  getAuditTrailSearchTemplate(): Observable<any> {
    return this.http.get('/audits/searchtemplate');
  }

  /**
   * @returns {Observable<any>} Fetches Mapping Data.
   */
  getEntityMappings(): Observable<any> {
    return this.http.get('/entitytoentitymapping');
  }

  /**
   * @param mappingId Mapping Id.
   * @param fromId From Entity ID.
   * @param toId  To Entity ID.
   * @returns {Observable<any>} fetches the list of mappings for particular mapping type
   */
  getEntitytoEntityData(mappingId: number, fromId: number, toId: number): Observable<any> {
    return this.http.get(`/entitytoentitymapping/${mappingId}/${fromId}/${toId}`);
  }

  /**
   * Get particular Map Data
   * @param mapId Mapping Id
   */
  getMapIdData(mapId: number): Observable<any> {
    return this.http.get(`/entitytoentitymapping/${mapId}`);
  }


  /**
   * Creates a new mapping
   * @param {any} mapType Map id to be created.
   * @param {any} mapData Map data to be added
   * @returns {Observable<any>} resolved data
   */
  createMapping(mapType: any, mapData: any): Observable<any> {
    return this.http.post(`/entitytoentitymapping/${mapType}`, mapData);
  }

  /**
   * Edit a mapping
   * @param {any} mapType Map id to be edited.
   * @param {any} mapData Map data to be added
   * @returns {Observable<any>} resolved data
   */
  editMapping(mapId: any, mapData: any): Observable<any> {
    return this.http.put(`/entitytoentitymapping/${mapId}`, mapData);
  }

  /**
   * Delete the Map Id
   * @param mapId Map Id
   */
  deleteMapping(mapId: any): Observable<any> {
    return this.http.delete(`/entitytoentitymapping/${mapId}`);
  }

  /**
   * @returns {Observable<any>} Offices data
   */
  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * @returns {Observable<any>} Loan products data.
   */
  getLoanProducts(): Observable<any> {
    return this.http.get('/loanproducts');
  }

  /**
   * @returns {Observable<any>} Saving products data
   */
  getSavingProducts(): Observable<any> {
    return this.http.get('/savingsproducts');
  }

  /**
   * @returns {Observable<any>} Charges data
   */
  getCharges(): Observable<any> {
    return this.http.get('/charges');
  }

  /**
   * @returns {Observable<any>}
   */
  getMakerCheckerPermissions(): Observable<any> {
    const httpParams = new HttpParams()
                      .set('makerCheckerable', 'true');
    return this.http.get('/permissions', {params: httpParams});
  }

  /**
   * @param data Maker Checker data
   * @returns {Observable<any>}
   */
  updateMakerCheckerPermission(data: any): Observable<any> {
    const httpParams = new HttpParams()
                      .set('makerCheckerable', 'true');
    return this.http.put('/permissions', data, { params: httpParams });
  }


}
