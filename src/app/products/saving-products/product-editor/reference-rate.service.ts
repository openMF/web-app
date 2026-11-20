/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { defer, map } from 'rxjs';
import {
  BenchmarkAudit,
  BenchmarkCapture,
  BenchmarkFixing,
  InterestConfiguration,
  RatePreview,
  ReferenceDefinition,
  ReferenceFormula,
  ReferenceTemplate,
  parseExactJson,
  readFormula,
  serializeExactJson
} from './interest-rate.model';

@Injectable({ providedIn: 'root' })
export class ReferenceRateService {
  private http = inject(HttpClient);
  private root = '/savingsproducts/reference-rates';
  private formulaRoot(id: number) {
    return `/savingsproducts/policy/${id}/reference-rate`;
  }
  private get<T>(path: string, params: Record<string, string> = {}) {
    return this.http
      .get(path, { responseType: 'text', params })
      .pipe(map((text) => (text ? parseExactJson<T>(text) : null)));
  }
  private post<T>(path: string, body: unknown) {
    return defer(() => {
      return this.http
        .post(path, serializeExactJson(body), {
          responseType: 'text',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
        .pipe(map((text) => parseExactJson<T>(text)));
    });
  }
  template() {
    return this.get<ReferenceTemplate>(this.root + '/template');
  }
  definitions() {
    return this.get<ReferenceDefinition[]>(this.root);
  }
  definition(id: string) {
    return this.get<ReferenceDefinition>(this.root + '/' + encodeURIComponent(id));
  }
  define(definition: Pick<ReferenceDefinition, 'referenceId' | 'referenceType' | 'tenor' | 'sourceDescription'>) {
    return this.post<ReferenceDefinition>(this.root, definition);
  }
  history(id: string) {
    return this.get<BenchmarkFixing[]>(`${this.root}/${encodeURIComponent(id)}/fixings`);
  }
  audit(id: string) {
    return this.get<BenchmarkAudit[]>(`${this.root}/${encodeURIComponent(id)}/audit`);
  }
  capture(id: string, capture: BenchmarkCapture) {
    return this.post<BenchmarkFixing>(`${this.root}/${encodeURIComponent(id)}/fixings`, capture);
  }
  action(fixing: BenchmarkFixing, action: 'submit' | 'approve' | 'reject', reason: string) {
    return this.post<BenchmarkFixing>(
      `${this.root}/${encodeURIComponent(fixing.referenceId)}/fixings/${fixing.version}/${action}`,
      { expectedRevision: fixing.revision, reason: reason || null }
    );
  }
  effective(id: string, tenor: string, businessDate: string) {
    return this.get<BenchmarkFixing>(`${this.root}/${encodeURIComponent(id)}/effective`, { tenor, businessDate });
  }
  configuration(id: number) {
    return this.get<InterestConfiguration<ReferenceFormula>>(this.formulaRoot(id)).pipe(
      map((c) => {
        if (!c || c.savingsProductId !== id || typeof c.financialOperational !== 'boolean')
          throw new Error('Incompatible formula response');
        return { ...c, formula: readFormula(c.formula) };
      })
    );
  }
  saveFormula(id: number, expectedRevision: number, formula: ReferenceFormula) {
    return defer(() => {
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) throw new Error('Invalid policy revision');
      return this.http
        .put(this.formulaRoot(id), serializeExactJson({ expectedRevision, formula: readFormula(formula) }), {
          responseType: 'text',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
        .pipe(map((text) => parseExactJson<InterestConfiguration<ReferenceFormula>>(text)));
    });
  }
  preview(id: number, businessDate: string) {
    return this.get<RatePreview>(this.formulaRoot(id) + '/preview', { businessDate });
  }
}
