/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BsCalendarService } from 'app/core/bs-calendar/bs-calendar.service';
import { SILENT_ERRORS } from 'app/core/http/error-handler.interceptor';

/** The stages the work page lists (fineract-dbug docs/lending.md, "Stages"). */
export type FileStage = 'DOCUMENTS' | 'APPRAISAL' | 'APPROVED';
export const FILE_STAGES: FileStage[] = [
  'DOCUMENTS',
  'APPRAISAL',
  'APPROVED'
];

/** One loan on the work page. */
export interface WorkPageRow {
  loanId: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  product: string;
  amount: number;
  officeId: number;
  officeName: string;
  officerId: number | null;
  officerName: string | null;
  stage: string;
  registerNumber: string | null;
  since: string | null;
  daysInStage: number;
  /** Required documents still missing; given for the Documents stage only. */
  missing: number | null;
}

export interface WorkPage {
  counts: Record<FileStage, number>;
  total: number;
  rows: WorkPageRow[];
}

export interface WorkPageQuery {
  stage: FileStage;
  /** `me`, `none` or a staff id; left out for everyone. */
  officer?: string;
  officeId?: number | null;
  search?: string;
  offset: number;
  limit: number;
}

export type DocumentStatus = 'DONE' | 'NOT_APPLICABLE' | null;

export interface FileDocument {
  code: string;
  label: string;
  required: boolean;
  applies: boolean;
  status: DocumentStatus;
  documentId: number | null;
  note: string | null;
  updatedBy: number | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

export interface FileHistoryEntry {
  on: string | null;
  at: string | null;
  source: 'FINERACT' | 'FILE';
  action: string;
  itemCode: string | null;
  detail: string | null;
  userId: number | null;
  userName: string | null;
}

/** One loan's file. */
export interface LoanFile {
  loanId: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  product: string;
  amount: number;
  officeId: number;
  officeName: string;
  officerId: number | null;
  officerName: string | null;
  status: number | null;
  stage: string;
  registerNumber: string | null;
  since: string | null;
  daysInStage: number;
  policyVersion: number | null;
  security: string[];
  documents: FileDocument[];
  missing: string[];
  history: FileHistoryEntry[];
}

/** What is sent to tick a document. */
export interface TickBody {
  status: 'DONE' | 'NOT_APPLICABLE';
  documentId?: number | null;
  note?: string | null;
}

/** Stages after which the file can no longer be changed. */
export function isReadOnlyStage(stage: string | null | undefined): boolean {
  return stage !== 'DOCUMENTS' && stage !== 'APPRAISAL';
}

/** Days in a stage after which the work page highlights the loan. */
export const SLOW_AFTER_DAYS = 7;

/** The loan file and the work page (fineract-dbug docs/lending.md, "The work page" and "One loan's file"). */
@Injectable({ providedIn: 'root' })
export class LoanFileService {
  private http = inject(HttpClient);
  private bsCalendar = inject(BsCalendarService);

  workPage(query: WorkPageQuery): Observable<WorkPage> {
    let params = new HttpParams().set('stage', query.stage).set('offset', query.offset).set('limit', query.limit);
    if (query.officer) {
      params = params.set('officer', query.officer);
    }
    if (query.officeId != null) {
      params = params.set('officeId', query.officeId);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    return this.http.get<Partial<WorkPage>>('/nepal/lending/files', { params }).pipe(
      map((page) => ({
        counts: { DOCUMENTS: 0, APPRAISAL: 0, APPROVED: 0, ...page.counts },
        total: page.total ?? 0,
        rows: (page.rows ?? []).map(rowWithNulls)
      }))
    );
  }

  /** With `silent`, a refusal raises no alert (for a look the user did not ask for). */
  get(loanId: number | string, silent = false): Observable<LoanFile> {
    const context = silent ? new HttpContext().set(SILENT_ERRORS, true) : undefined;
    return this.http.get<Partial<LoanFile>>(`/nepal/lending/files/${loanId}`, { context }).pipe(map(fileWithNulls));
  }

  tick(loanId: number, code: string, body: TickBody): Observable<LoanFile> {
    return this.http
      .put<Partial<LoanFile>>(`/nepal/lending/files/${loanId}/documents/${code}`, body)
      .pipe(map(fileWithNulls));
  }

  undo(loanId: number, code: string): Observable<LoanFile> {
    return this.http
      .delete<Partial<LoanFile>>(`/nepal/lending/files/${loanId}/documents/${code}`)
      .pipe(map(fileWithNulls));
  }

  complete(loanId: number): Observable<LoanFile> {
    return this.http.post<Partial<LoanFile>>(`/nepal/lending/files/${loanId}/complete`, {}).pipe(map(fileWithNulls));
  }

  reopen(loanId: number, reason: string): Observable<LoanFile> {
    return this.http
      .post<Partial<LoanFile>>(`/nepal/lending/files/${loanId}/reopen`, { reason })
      .pipe(map(fileWithNulls));
  }

  addNote(loanId: number, text: string): Observable<LoanFile> {
    return this.http.post<Partial<LoanFile>>(`/nepal/lending/files/${loanId}/notes`, { text }).pipe(map(fileWithNulls));
  }

  /** "18 Kartik 2083" for an AD date ("2026-11-18") or date-time; empty when there is none. */
  bsDate(value: string | null | undefined): string {
    return value ? this.bsCalendar.formatLong(this.bsCalendar.toBs(value.slice(0, 10))) : '';
  }
}

function rowWithNulls(r: Partial<WorkPageRow>): WorkPageRow {
  return {
    loanId: r.loanId,
    accountNo: r.accountNo ?? '',
    clientId: r.clientId,
    clientName: r.clientName ?? '',
    product: r.product ?? '',
    amount: r.amount ?? 0,
    officeId: r.officeId,
    officeName: r.officeName ?? '',
    officerId: r.officerId ?? null,
    officerName: r.officerName ?? null,
    stage: r.stage ?? '',
    registerNumber: r.registerNumber ?? null,
    since: r.since ?? null,
    daysInStage: r.daysInStage ?? 0,
    missing: r.missing ?? null
  };
}

/** The backend leaves null fields out of its answer: read a missing field as null. */
function fileWithNulls(f: Partial<LoanFile>): LoanFile {
  return {
    loanId: f.loanId,
    accountNo: f.accountNo ?? '',
    clientId: f.clientId,
    clientName: f.clientName ?? '',
    product: f.product ?? '',
    amount: f.amount ?? 0,
    officeId: f.officeId,
    officeName: f.officeName ?? '',
    officerId: f.officerId ?? null,
    officerName: f.officerName ?? null,
    status: f.status ?? null,
    stage: f.stage ?? '',
    registerNumber: f.registerNumber ?? null,
    since: f.since ?? null,
    daysInStage: f.daysInStage ?? 0,
    policyVersion: f.policyVersion ?? null,
    security: f.security ?? [],
    documents: (f.documents ?? []).map((d) => ({
      code: d.code,
      label: d.label ?? d.code,
      required: d.required ?? false,
      applies: d.applies ?? true,
      status: d.status ?? null,
      documentId: d.documentId ?? null,
      note: d.note ?? null,
      updatedBy: d.updatedBy ?? null,
      updatedByName: d.updatedByName ?? null,
      updatedAt: d.updatedAt ?? null
    })),
    missing: f.missing ?? [],
    history: (f.history ?? []).map((h) => ({
      on: h.on ?? null,
      at: h.at ?? null,
      source: h.source,
      action: h.action,
      itemCode: h.itemCode ?? null,
      detail: h.detail ?? null,
      userId: h.userId ?? null,
      userName: h.userName ?? null
    }))
  };
}
