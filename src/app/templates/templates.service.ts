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
import { Observable, catchError, concatMap, from, map, of, switchMap, toArray } from 'rxjs';
import { expandArrays, mapperPath, renderTemplate } from './template-merge';

/**
 * Templates service.
 */
@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private http = inject(HttpClient);

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
  /**
   * The template filled with an entity's data, as HTML (template-merge.ts). `scope` names the entity, `{ loanId }` or
   * `{ clientId }`. Mappers run in their order, so a later one can use an earlier one's data, as on the server; one
   * that fails is left out (the error handler reports it) and its placeholders print empty.
   */
  fillTemplate(templateId: string | number, scope: Record<string, unknown>): Observable<string> {
    return this.http.get<any>(`/templates/${templateId}`).pipe(
      switchMap((template) => {
        const values: Record<string, unknown> = { ...scope };
        const mappers = [...(template.mappers ?? [])].sort((a: any, b: any) => a.mapperorder - b.mapperorder);
        return from(mappers).pipe(
          concatMap((mapper: any) =>
            this.http.get(mapperPath(mapper.mappervalue, values)).pipe(
              catchError(() => of(undefined)),
              map((data) => (values[mapper.mapperkey] = data))
            )
          ),
          toArray(),
          map(() => renderTemplate(template.text, expandArrays(values)))
        );
      })
    );
  }

  getTemplate(templateId: string): Observable<any> {
    return this.http.get(`/templates/${templateId}`);
  }

  /**
   * @returns {Observable<any>}.
   */
  getCreateTemplateData(): Observable<any> {
    return this.http.get('/templates/template');
  }

  /**
   * @param templateId Template Id.
   * @returns {Observable<any>}.
   */
  getEditTemplateData(templateId: string): Observable<any> {
    return this.http.get(`/templates/${templateId}/template`);
  }

  /**
   * @param templateData Template to be created.
   * @param templateId Template Id.
   * @returns {Observable<any>}.
   */
  createTemplate(templateData: any): Observable<any> {
    return this.http.post(`/templates`, templateData);
  }

  /**
   * @param templateData Templete Data to be edited.
   * @param templateId Template Id.
   * @returns {Observable<any>}.
   */
  updateTemplate(templateData: any, templateId: any): Observable<any> {
    // Fineract takes the template's id from the body, not the URL, and refuses an update without it.
    return this.http.put(`/templates/${templateId}`, { ...templateData, id: Number(templateId) });
  }

  /**
   * @param templateId Template ID.
   * @returns {Observable<any>}
   */
  deleteTemplate(templateId: string): Observable<any> {
    return this.http.delete(`/templates/${templateId}`);
  }
}
