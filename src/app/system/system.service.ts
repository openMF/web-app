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
   * @returns {Observable<any>} Fetches Roles and Permissions
   */
  getRoles(): Observable<any> {
    return this.http.get('/roles');
  }

  /**
   * @returns {Observable<any>} Fetches Codes.
   */
  getCodes(): Observable<any> {
    return this.http.get('/codes');
  }

  /**
   * @returns {Observable<any>} Fetches Surveys.
   */
  getSurveys(): Observable<any> {
    return this.http.get('/surveys');
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
   * @param {any} code Code to be created.
   * @returns {Observable<any>}
   */
  createCode(code: any): Observable<any> {
    return this.http.post('/codes', code);
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

}
