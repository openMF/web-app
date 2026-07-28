/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  KycReadinessResult,
  BureauResponseDTO,
  AuditEntryDTO,
  SubmissionRecord,
  SubmissionRunResponse,
  DisputeCase,
  PagedResult,
  AuditParams,
  CbildRole
} from './credit-bureau.models';

/** Dev credentials — production: replace with Fineract JWT or env-based auth */
const CBILD_ROLE_CREDENTIALS: Record<string, string> = {
  KYC_OFFICER: btoa('kyc_officer:password'),
  CREDIT_ANALYST: btoa('credit_analyst:password'),
  COMPLIANCE: btoa('compliance:password')
};

const CBILD_ROLE_KEY = 'cbild_role';
const CBILD_CREDENTIALS_KEY = 'cbild_credentials';

/**
 * CB-ILD — Credit Bureau Information Lifecycle Dashboard
 * MSOC 2026 — Mifos Initiative
 *
 * Angular service connecting openMF/web-app to the CB-ILD Spring Boot backend.
 * Backend runs on port 8084 (configured via environment.pluginBaseUrl).
 *
 * Uses HttpBackend to bypass Fineract interceptors — CB-ILD has its own
 * Basic auth users separate from Fineract (kyc_officer, credit_analyst, compliance).
 *
 * RFC tax ID is never logged, stored, or displayed in the frontend.
 *
 * @see https://github.com/openMF/mifos-x-credit-bureau-plugin/tree/main/cb-ild
 * @author Satyam Mishra — MSOC 2026
 */
@Injectable({ providedIn: 'root' })
export class CreditBureauService {
  private httpBackend = inject(HttpBackend);
  private externalHttp = new HttpClient(this.httpBackend);
  private baseUrl = (() => {
    const url = environment.pluginBaseUrl;
    if (!url.startsWith('http://localhost') && !url.startsWith('https://')) {
      console.warn('CB-ILD: pluginBaseUrl should use HTTPS in production');
    }
    return url;
  })();

  setRole(role: CbildRole): void {
    sessionStorage.setItem(CBILD_ROLE_KEY, role);
    sessionStorage.setItem(CBILD_CREDENTIALS_KEY, CBILD_ROLE_CREDENTIALS[role]);
  }

  getRole(): CbildRole {
    const stored = sessionStorage.getItem(CBILD_ROLE_KEY);
    const validRoles: CbildRole[] = [
      'KYC_OFFICER',
      'CREDIT_ANALYST',
      'COMPLIANCE'
    ];
    return stored && validRoles.includes(stored as CbildRole) ? (stored as CbildRole) : 'CREDIT_ANALYST';
  }

  getHeaders(): HttpHeaders {
    const credentials = sessionStorage.getItem(CBILD_CREDENTIALS_KEY) || CBILD_ROLE_CREDENTIALS['CREDIT_ANALYST'];
    return new HttpHeaders({
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });
  }

  getBureauReadiness(clientId: number): Observable<KycReadinessResult> {
    return this.externalHttp.get<KycReadinessResult>(`${this.baseUrl}/api/clients/${clientId}/bureau-readiness`, {
      headers: this.getHeaders()
    });
  }

  getSubmissionHistory(page = 0, size = 20, clientId?: number): Observable<PagedResult<SubmissionRecord>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }
    return this.externalHttp.get<PagedResult<SubmissionRecord>>(`${this.baseUrl}/api/submissions/history`, {
      headers: this.getHeaders(),
      params
    });
  }

  runSubmissions(clientIds?: number[]): Observable<SubmissionRunResponse> {
    return this.externalHttp.post<SubmissionRunResponse>(
      `${this.baseUrl}/api/submissions/run`,
      clientIds && clientIds.length > 0 ? { clientIds } : null,
      { headers: this.getHeaders() }
    );
  }

  getRetrySchedule(): Observable<SubmissionRecord[]> {
    return this.externalHttp.get<SubmissionRecord[]>(`${this.baseUrl}/api/submissions/schedule`, {
      headers: this.getHeaders()
    });
  }

  reportScreening(clientId: number, loanId: number | null, inquiryType: 'HARD' | 'SOFT'): Observable<SubmissionRecord> {
    return this.externalHttp.post<SubmissionRecord>(
      `${this.baseUrl}/api/submissions/report-screening`,
      { clientId, loanId, inquiryType },
      { headers: this.getHeaders() }
    );
  }

  reportApproval(clientId: number, loanId: number): Observable<SubmissionRecord> {
    return this.externalHttp.post<SubmissionRecord>(
      `${this.baseUrl}/api/submissions/report-approval`,
      { clientId, loanId },
      { headers: this.getHeaders() }
    );
  }

  getBureauResponse(clientId: number): Observable<BureauResponseDTO> {
    return this.externalHttp.get<BureauResponseDTO>(`${this.baseUrl}/api/clients/${clientId}/bureau-response`, {
      headers: this.getHeaders()
    });
  }

  createDispute(submissionRecordId: number, disputeDetails: string): Observable<DisputeCase> {
    return this.externalHttp.post<DisputeCase>(
      `${this.baseUrl}/api/disputes`,
      { submissionRecordId, disputeDetails },
      { headers: this.getHeaders() }
    );
  }

  updateDisputeStatus(disputeId: number, newStatus: string): Observable<DisputeCase> {
    return this.externalHttp.put<DisputeCase>(
      `${this.baseUrl}/api/disputes/${disputeId}/status`,
      { newStatus },
      { headers: this.getHeaders() }
    );
  }

  getDispute(disputeId: number): Observable<DisputeCase> {
    return this.externalHttp.get<DisputeCase>(`${this.baseUrl}/api/disputes/${disputeId}`, {
      headers: this.getHeaders()
    });
  }

  getAuditTrail(clientId: number, params: AuditParams = {}): Observable<PagedResult<AuditEntryDTO>> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 0).toString())
      .set('size', (params.size ?? 20).toString());
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.externalHttp.get<PagedResult<AuditEntryDTO>>(`${this.baseUrl}/api/clients/${clientId}/audit-trail`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }
}
