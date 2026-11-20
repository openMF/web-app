/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { SILENT_ERRORS } from 'app/core/http/error-handler.interceptor';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';
import {
  AmlSettings,
  AmlSettingsView,
  CashClass,
  ComplianceAccess,
  GoamlCodeLists,
  GoamlLookup,
  GoamlReport,
  LedgerStatus,
  TtrItem,
  TtrItemDetail,
  TtrStatus,
  TtrSummary
} from './compliance.models';

const NO_ACCESS: ComplianceAccess = { permissions: [], showMenu: false, holders: null };

/**
 * Anti-money-laundering compliance (fineract-dbug ADR 0036 to 0041). Compliance data is need-to-know: the backend grants
 * it only to roles that hold the compliance permissions by name (not "All functions"), so the screens ask
 * /nepal/aml/access what to show instead of reading the user's permission list, and call nothing else without it
 * (the global error handler would alert on every refused call).
 */
@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private http = inject(HttpClient);
  private access$?: Observable<ComplianceAccess>;

  /** The last access answer, for templates. */
  readonly access = signal<ComplianceAccess>(NO_ACCESS);

  /** What this user may see; asked once per sign-in. A failure means no access. */
  loadAccess(refresh = false): Observable<ComplianceAccess> {
    if (!this.access$ || refresh) {
      this.access$ = this.http
        // a backend without compliance answers 404; that only means no menu, not an error to show
        .get<ComplianceAccess>('/nepal/aml/access', { context: new HttpContext().set(SILENT_ERRORS, true) })
        .pipe(
          catchError(() => of(NO_ACCESS)),
          tap((a) => this.access.set(a)),
          shareReplay(1)
        );
    }
    return this.access$;
  }

  /** Forget the answer (after signing out or in as someone else). */
  reset(): void {
    this.access$ = undefined;
    this.access.set(NO_ACCESS);
  }

  can(...anyOf: string[]): boolean {
    const held = this.access().permissions ?? [];
    return anyOf.some((p) => held.includes(p));
  }

  settings(): Observable<AmlSettingsView> {
    return this.http.get<AmlSettingsView>('/nepal/aml/settings');
  }

  updateSettings(
    changes: Partial<AmlSettings> & { paymentClasses?: { paymentTypeId: number; cashClass: CashClass }[] }
  ): Observable<any> {
    return this.http.put('/nepal/aml/settings', changes);
  }

  ttrSummary(): Observable<TtrSummary> {
    return this.http.get<TtrSummary>('/nepal/aml/ttr/summary');
  }

  ttrItems(status?: TtrStatus | 'ALL', officeId?: number | null): Observable<TtrItem[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (officeId) {
      params = params.set('officeId', officeId);
    }
    return this.http.get<TtrItem[]>('/nepal/aml/ttr', { params });
  }

  ttrItem(id: number): Observable<TtrItemDetail> {
    return this.http.get<TtrItemDetail>(`/nepal/aml/ttr/${id}`);
  }

  decideTtr(id: number, command: 'exempt' | 'report' | 'reopen', reason?: string): Observable<TtrItem> {
    return this.http.post<TtrItem>(`/nepal/aml/ttr/${id}`, reason ? { reason } : {}, { params: { command } });
  }

  goamlReports(status?: string): Observable<GoamlReport[]> {
    return this.http.get<GoamlReport[]>('/nepal/aml/goaml/reports', status ? { params: { status } } : {});
  }

  makeTtrReports(ttrItemIds: number[]): Observable<GoamlReport[]> {
    return this.http.post<GoamlReport[]>('/nepal/aml/goaml/reports', { type: 'TTR', ttrItemIds });
  }

  decideReport(
    id: number,
    command: 'regenerate' | 'submitted' | 'accepted' | 'rejected' | 'correct' | 'discard',
    body: Record<string, string> = {}
  ): Observable<GoamlReport> {
    return this.http.post<GoamlReport>(`/nepal/aml/goaml/reports/${id}`, body, { params: { command } });
  }

  reportXml(id: number): Observable<Blob> {
    return this.http.get(`/nepal/aml/goaml/reports/${id}/xml`, { responseType: 'blob' });
  }

  ledgerStatus(): Observable<LedgerStatus> {
    return this.http.get<LedgerStatus>('/nepal/aml/movements/status');
  }

  /** FIU-Nepal's codes (fineract-dbug #288; docs/goaml-reports.md, "Codes"): our rows, grouped by `type`. */
  goamlLookups(): Observable<GoamlLookup[]> {
    return this.http.get<GoamlLookup[]>('/nepal/aml/goaml/lookups');
  }

  /** For each lookup `type`, the codes the schema in use allows - `institution` has none, it is free text. */
  goamlCodeLists(): Observable<GoamlCodeLists> {
    return this.http.get<GoamlCodeLists>('/nepal/aml/goaml/code-lists');
  }

  updateGoamlLookups(rows: GoamlLookup[]): Observable<GoamlLookup[]> {
    return this.http.put<GoamlLookup[]>('/nepal/aml/goaml/lookups', rows);
  }
}
