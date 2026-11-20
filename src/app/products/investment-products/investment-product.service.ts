/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable, catchError, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { HANDLE_HTTP_ERROR_LOCALLY } from 'app/core/http/error-handler.interceptor';
import { ProductsService } from '../products.service';
import { InvestmentAccessService } from './investment-access.service';
import { parseInvestmentJson, serializeInvestmentJson } from './investment-json';
import {
  CatalogEntry,
  NativeCatalogProduct,
  PolicyAudit,
  PolicyConfiguration,
  PolicyTemplate,
  PolicyValidation,
  PolicyWrite,
  RateAudit,
  RateConfiguration,
  RateSelection,
  RateTemplate,
  RateValidation,
  RateWrite
} from './investment-product.models';

export function investmentError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse))
    return error instanceof Error && error.message.startsWith('Investment.')
      ? error.message
      : 'Investment.invalidResponse';
  const keys: Record<number, string> = {
    401: 'authentication',
    403: 'forbidden',
    404: 'notFound',
    409: 'conflict',
    422: 'publicationBlocked',
    0: 'unavailable',
    502: 'unavailable',
    503: 'unavailable',
    504: 'unavailable'
  };
  return 'Investment.' + (keys[error.status] ?? 'requestFailed');
}
/** A stale revision or an uncertain mutation must be checked against the server before retrying. */
export function requiresInvestmentReload(error: unknown, writeStarted: boolean): boolean {
  if (!(error instanceof HttpErrorResponse)) return writeStarted;
  const { status } = error;
  return status === 409 || (writeStarted && (status < 400 || status === 408 || status >= 500));
}
export function errorBlockers(error: HttpErrorResponse): string[] {
  try {
    return (typeof error.error === 'string' ? JSON.parse(error.error) : error.error)?.blockers ?? [];
  } catch {
    return [];
  }
}
export function validationDetails(error: HttpErrorResponse): { field: string; message: string }[] {
  try {
    const body = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
    return (body?.errors ?? []).map((entry: { parameterName?: string; defaultUserMessage?: string }) => ({
      field: entry.parameterName ?? '',
      message: entry.defaultUserMessage ?? ''
    }));
  } catch {
    return [];
  }
}
@Injectable({ providedIn: 'root' })
export class InvestmentProductService {
  private http = inject(HttpClient);
  private products = inject(ProductsService);
  private access = inject(InvestmentAccessService);
  private policyRoot = '/v1/investment-products/configuration';
  private rates(id: number) {
    return `/v1/investment-products/${id}/rates`;
  }
  private request<T>(method: string, url: string, body?: unknown, params?: HttpParams): Observable<T> {
    return this.http
      .request(method, url, {
        body: body === undefined ? undefined : serializeInvestmentJson(body),
        params,
        responseType: 'text',
        context: new HttpContext().set(HANDLE_HTTP_ERROR_LOCALLY, true),
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })
      .pipe(map((text) => (text ? parseInvestmentJson<T>(text) : null)));
  }
  private page(offset = 0, limit = 25) {
    return new HttpParams().set('offset', offset).set('limit', Math.max(1, Math.min(200, limit)));
  }
  getNativeFixedDepositProducts(): Observable<NativeCatalogProduct[]> {
    return this.products.getFixedDepositProducts();
  }
  getInvestmentTemplate() {
    return this.request<PolicyTemplate>('GET', this.policyRoot + '/template');
  }
  getInvestmentConfiguration(id: number) {
    return this.request<PolicyConfiguration>('GET', this.policyRoot + '/' + id);
  }
  validateInvestmentConfiguration(id: number, body: PolicyWrite) {
    return this.request<PolicyValidation>('POST', this.policyRoot + `/${id}/validate`, body);
  }
  saveInvestmentConfiguration(id: number, body: PolicyWrite) {
    return this.request<PolicyConfiguration>('PUT', this.policyRoot + '/' + id, body);
  }
  getInvestmentHistory(id: number, offset = 0, limit = 25) {
    return this.request<PolicyAudit[]>('GET', this.policyRoot + `/${id}/history`, undefined, this.page(offset, limit));
  }
  getRateTemplate(id: number) {
    return this.request<RateTemplate>('GET', this.rates(id) + '/template');
  }
  getCurrentRate(id: number) {
    return this.request<RateConfiguration | null>('GET', this.rates(id));
  }
  getRateDraft(id: number) {
    return this.request<RateConfiguration>('GET', this.rates(id) + '/draft');
  }
  validateRateDraft(id: number, body: RateWrite) {
    return this.request<RateValidation>('POST', this.rates(id) + '/validate', body);
  }
  saveRateDraft(id: number, body: RateWrite) {
    return this.request<RateConfiguration>('PUT', this.rates(id) + '/draft', body);
  }
  publishRate(id: number, expectedRevision: number) {
    return this.request<RateConfiguration>('POST', this.rates(id) + '/publish', { expectedRevision });
  }
  getRateVersions(id: number, offset = 0, limit = 25) {
    return this.request<RateConfiguration[]>('GET', this.rates(id) + '/versions', undefined, this.page(offset, limit));
  }
  getRateVersion(id: number, version: number) {
    return this.request<RateConfiguration>('GET', this.rates(id) + '/versions/' + version);
  }
  getRateSchedule(id: number, offset = 0, limit = 25) {
    return this.request<RateConfiguration[]>('GET', this.rates(id) + '/schedule', undefined, this.page(offset, limit));
  }
  getRateHistory(id: number, offset = 0, limit = 25) {
    return this.request<RateAudit[]>('GET', this.rates(id) + '/history', undefined, this.page(offset, limit));
  }
  selectRate(id: number, query: { amount: string; termDays: number; asOfInstant?: string }) {
    let params = new HttpParams().set('amount', query.amount).set('termDays', query.termDays);
    if (query.asOfInstant) params = params.set('asOfInstant', query.asOfInstant);
    return this.request<RateSelection>('GET', this.rates(id) + '/selection', undefined, params);
  }
  /** Native catalog is authoritative. At most four product associations are in flight. */
  catalog(): Observable<CatalogEntry[]> {
    return this.getNativeFixedDepositProducts().pipe(
      switchMap((products) =>
        from(products).pipe(
          mergeMap((native): Observable<CatalogEntry> => {
            if (!this.access.has('READ_INVESTMENT_PRODUCT_POLICY'))
              return of({ native, error: 'Investment.forbidden' });
            return this.getInvestmentConfiguration(native.id).pipe(
              switchMap((configuration) => {
                const entry: CatalogEntry = { native, configuration };
                if (
                  !configuration.policy ||
                  !this.access.has('READ_INVESTMENT_RATE') ||
                  !configuration.capabilities.rateConfigurationSupported
                )
                  return of(entry);
                return this.getCurrentRate(native.id).pipe(
                  map((rate): CatalogEntry => ({ ...entry, rateStatus: rate?.status ?? 'NO_APPLICABLE_RATE' })),
                  catchError((error) => of({ ...entry, rateError: investmentError(error) }))
                );
              }),
              catchError((error) => of({ native, error: investmentError(error) }))
            );
          }, 4),
          toArray(),
          map((entries) => entries.sort((a, b) => a.native.name.localeCompare(b.native.name)))
        )
      )
    );
  }
}
