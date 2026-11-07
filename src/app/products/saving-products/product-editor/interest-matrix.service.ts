/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { defer, map } from 'rxjs';
import {
  BracketSelection,
  InterestConfiguration,
  InterestMatrix,
  parseExactJson,
  readMatrix,
  serializeExactJson
} from './interest-rate.model';

@Injectable({ providedIn: 'root' })
export class InterestMatrixService {
  private http = inject(HttpClient);
  private root(id: number) {
    return `/savingsproducts/policy/${id}/interest-matrix`;
  }
  configuration(id: number) {
    return this.http.get(this.root(id), { responseType: 'text' }).pipe(
      map((text) => {
        const c = parseExactJson<InterestConfiguration<InterestMatrix>>(text);
        if (c.savingsProductId !== id || typeof c.financialOperational !== 'boolean')
          throw new Error('Incompatible matrix response');
        return { ...c, matrix: readMatrix(c.matrix) };
      })
    );
  }
  write(id: number, expectedRevision: number, matrix: InterestMatrix, validate = false) {
    return defer(() => {
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) throw new Error('Invalid policy revision');
      const body = serializeExactJson({ expectedRevision, matrix: readMatrix(matrix) });
      const options = {
        responseType: 'text' as const,
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };
      return (
        validate
          ? this.http.post(this.root(id) + '/validate', body, options)
          : this.http.put(this.root(id), body, options)
      ).pipe(map((text) => parseExactJson<InterestConfiguration<InterestMatrix>>(text)));
    });
  }
  selection(id: number, balance: string, businessDate: string) {
    return this.http
      .get(this.root(id) + '/selection', {
        responseType: 'text',
        params: new HttpParams().set('balance', balance).set('businessDate', businessDate)
      })
      .pipe(map((text) => parseExactJson<BracketSelection>(text)));
  }
}
