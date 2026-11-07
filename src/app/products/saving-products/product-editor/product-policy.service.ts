/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ProductsService } from 'app/products/products.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { readMatrix, readFormula } from './interest-rate.model';
import { Observable, map, of, switchMap } from 'rxjs';
import {
  PolicyAudit,
  PolicyCapabilities,
  PolicyCharge,
  PolicyConfiguration,
  PolicyReview,
  PolicyVersion,
  ProductPolicy,
  eligibleFee,
  parsePolicyJson,
  serializePolicy
} from './product-policy.model';

@Injectable({ providedIn: 'root' })
export class ProductPolicyService {
  private http = inject(HttpClient);
  private products = inject(ProductsService);
  private root = '/savingsproducts/policy';
  private get<T>(path: string): Observable<T> {
    return this.http
      .get(this.root + path, { responseType: 'text' })
      .pipe(map((text) => (text ? parsePolicyJson<T>(text) : null)));
  }
  businessDate() {
    return this.http
      .get<{ enabled: boolean }>('/configurations/name/enable-business-date')
      .pipe(
        switchMap((config) =>
          config.enabled
            ? this.http
                .get<{ date: number[] }>('/businessdate/BUSINESS_DATE')
                .pipe(
                  map((data) =>
                    Array.isArray(data.date) && data.date.length === 3
                      ? data.date.map((value, index) => String(value).padStart(index ? 2 : 4, '0')).join('-')
                      : null
                  )
                )
            : of(null)
        )
      );
  }
  template() {
    return this.get<PolicyCapabilities>('/template');
  }
  configuration(id: number) {
    return this.get<PolicyConfiguration>('/' + id).pipe(
      map((config) => {
        if (!config || config.savingsProductId !== id || ![
            'DRAFT',
            'UNCONFIGURED'
          ].includes(
            config.status
          ) || (config.status === 'DRAFT' && (!Number.isSafeInteger(config.revision) || config.revision <= 0 || !config.policy)) || (config.status === 'UNCONFIGURED' && (config.revision != null || config.policy != null))) {
          throw new Error('Invalid policy configuration response');
        }
        // Fineract's JSON provider omits null record fields for UNCONFIGURED products.
        return {
          ...config,
          revision: config.revision ?? null,
          policy: config.policy
            ? {
                ...config.policy,
                interestMatrix: readMatrix(config.policy.interestMatrix),
                referenceRate: readFormula(config.policy.referenceRate)
              }
            : null
        };
      })
    );
  }
  versions(id: number) {
    return this.get<PolicyVersion[]>('/' + id + '/versions');
  }
  active(id: number) {
    return this.get<PolicyVersion | null>('/' + id + '/active');
  }
  audit(id: number) {
    return this.get<PolicyAudit[]>('/' + id + '/audit');
  }
  review(id: number, version: number) {
    return this.get<PolicyReview>(`/${id}/versions/${version}`);
  }
  pending() {
    return this.get<PolicyVersion[]>('/pending');
  }
  fees() {
    return this.products.getCharges().pipe(map((charges: PolicyCharge[]) => charges.filter(eligibleFee)));
  }
  save(id: number, revision: number, policy: ProductPolicy) {
    // A preflight never rebases stale input: the same expectedRevision is also checked atomically by BE-02.
    return this.configuration(id).pipe(
      switchMap((latest) => {
        if ((latest.revision ?? 0) !== revision) throw new HttpErrorResponse({ status: 409, statusText: 'Conflict' });
        const complete = {
          ...policy,
          interestMatrix:
            policy.interestMatrix === undefined ? latest.policy?.interestMatrix : readMatrix(policy.interestMatrix),
          referenceRate:
            policy.referenceRate === undefined ? latest.policy?.referenceRate : readFormula(policy.referenceRate)
        };
        return this.http
          .put(this.root + '/' + id, serializePolicy(revision, complete), {
            responseType: 'text',
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
          })
          .pipe(map((text) => parsePolicyJson<PolicyConfiguration>(text)));
      })
    );
  }
  submit(id: number, expectedRevision: number, effectiveDate: string) {
    return this.http
      .post(`${this.root}/${id}/submit`, { expectedRevision, effectiveDate }, { responseType: 'text' })
      .pipe(map((text) => parsePolicyJson<PolicyVersion>(text)));
  }
  decide(id: number, version: number, approve: boolean, reason: string) {
    return this.http
      .post(`${this.root}/${id}/versions/${version}/${approve ? 'approve' : 'reject'}`, reason ? { reason } : {}, {
        responseType: 'text'
      })
      .pipe(map((text) => parsePolicyJson<PolicyVersion>(text)));
  }
}
