/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Templates service.
 */
@Injectable({
  providedIn: 'root'
})
export class TemplatesService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Templates data
   */
  getTemplates(): Observable<any> {
    return this.http.get('/templates');
  }

  /**
   * @param templateId Template ID.
   * @returns {Observable<any>} Fetches Template.
   */
  getTemplate(templateId: string): Observable<any> {
    return this.http.get(`/templates/${templateId}`);
  }

  /**
   * @param templateId Template ID.
   * @returns {Observable<any>}
   */
  deleteTemplate(templateId: string): Observable<any> {
    return this.http.delete(`/templates/${templateId}`);
  }

}
