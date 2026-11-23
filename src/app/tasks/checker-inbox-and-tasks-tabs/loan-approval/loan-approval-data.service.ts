/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { parseExactJson } from 'app/products/saving-products/product-editor/interest-rate.model';
import { SettingsService } from 'app/settings/settings.service';
import { ApprovalLoan, ApprovalSnapshot, pendingLoan } from './loan-approval.models';

export const LOAN_AGGREGATE_LIMIT = 1000;
@Injectable({ providedIn: 'root' })
export class LoanApprovalDataService {
  private http = inject(HttpClient);
  private settings = inject(SettingsService);
  // Persist before POST so a reload cannot make an uncertain command eligible again.
  // In-memory locks retain the existing protection during ordinary queue navigation.
  private locks = new Set<string>();
  private key(id: number): string {
    return (
      'mifosXLoanApprovalAttempt:' +
      JSON.stringify([
        this.settings.serverUrl,
        this.settings.tenantIdentifier,
        id
      ])
    );
  }
  locked(id: number): boolean {
    const key = this.key(id);
    if (this.locks.has(key)) return true;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return true;
    }
  }
  lock(id: number): boolean {
    const key = this.key(id);
    try {
      localStorage.setItem(key, 'pending-verification');
      if (localStorage.getItem(key) !== 'pending-verification') return false;
    } catch {
      return false;
    }
    this.locks.add(key);
    return true;
  }
  /** Release only before POST, or after a confirmed failure and an identity-matched, still-pending detail read. */
  unlock(id: number): void {
    const key = this.key(id);
    try {
      localStorage.removeItem(key);
      if (localStorage.getItem(key) !== null) return;
    } catch {
      return;
    }
    this.locks.delete(key);
  }

  private exactGet<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get(url, { params, responseType: 'text' }).pipe(
      map((text) =>
        parseExactJson<T>(text, [
          'principal',
          'approvalAmount'
        ])
      )
    );
  }
  page(limit: number, offset: number): Observable<ApprovalSnapshot> {
    // Verified LoansApiResource uses numeric status, offset/limit and stable id ordering. sqlSearch is not supported there.
    const params = new HttpParams()
      .set('status', '100')
      .set('offset', offset)
      .set('limit', limit)
      .set('orderBy', 'id')
      .set('sortOrder', 'ASC');
    return this.exactGet<{ pageItems: ApprovalLoan[]; totalFilteredRecords?: number }>('/loans', params).pipe(
      map((response) => {
        if (!Array.isArray(response?.pageItems)) throw new Error('Invalid loan response');
        const raw = response.pageItems;
        const valid = raw.every(pendingLoan) && new Set(raw.map((row) => row.id)).size === raw.length;
        const total =
          valid &&
          Number.isSafeInteger(response.totalFilteredRecords) &&
          response.totalFilteredRecords >= raw.length &&
          raw.length <= Math.max(0, response.totalFilteredRecords - offset)
            ? response.totalFilteredRecords
            : null;
        return {
          rows: [
            ...new Map(
              raw.filter(pendingLoan).map((row) => [
                row.id,
                row
              ])
            ).values()
          ],
          total,
          complete: valid && offset === 0 && total !== null && total === raw.length
        };
      })
    );
  }
  detail(id: number): Observable<ApprovalLoan> {
    return this.exactGet<ApprovalLoan>(`/loans/${id}`);
  }
  review(loan: ApprovalLoan): Observable<{ detail: ApprovalLoan; template: any }> {
    // Same approval-template contract as LoansService.getLoanApprovalTemplate; preserve decimal tokens at this boundary.
    return forkJoin({
      detail: this.detail(loan.id),
      template: this.exactGet(
        `/loans/${loan.id}/template`,
        new HttpParams().set('templateType', 'approval').set('associations', 'delinquency')
      )
    });
  }
}
