/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AccountBucket,
  AdjustmentProposal,
  Assessment,
  AssessmentSummary,
  ControlRecord,
  CorrectionReview,
  Eligibility,
  History,
  PolicyApproval,
  PolicyApprovalRequest,
  PolicyDraftRequest,
  PolicyEvent,
  PolicyResolution,
  Preview,
  ProposalRequest,
  ReclassificationEvidence,
  ReconciliationRequest,
  SaveAssessmentRequest,
  Template
} from '../models/anpa-accounting.model';

/** Uses the existing HTTP interceptor chain for API prefix, authentication and tenant scope. */
@Injectable({ providedIn: 'root' })
export class AnpaAccountingService {
  private readonly http = inject(HttpClient);
  private readonly base = '/v1/loans/anpa-writeoff';
  private loan(loanId: number): string {
    if (!Number.isSafeInteger(loanId) || loanId <= 0) {
      throw new Error('Invalid loan ID');
    }
    return `${this.base}/loans/${loanId}`;
  }
  private page(after: number, limit: number): HttpParams {
    if (!Number.isSafeInteger(after) || after < 0 || !Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new Error('Invalid pagination');
    }
    return new HttpParams().set('after', after).set('limit', limit);
  }
  getCapabilities(): Observable<Template> {
    return this.http.get<Template>(`${this.base}/template`);
  }
  getEligibility(loanId: number): Observable<Eligibility> {
    return this.http.get<Eligibility>(`${this.loan(loanId)}/eligibility`);
  }
  getHistory(loanId: number): Observable<History> {
    return this.http.get<History>(`${this.loan(loanId)}/history`);
  }
  getReceivables(loanId: number): Observable<AccountBucket[]> {
    return this.http.get<AccountBucket[]>(`${this.loan(loanId)}/receivables`);
  }
  getPreview(loanId: number, asOf: string): Observable<Preview> {
    return this.http.get<Preview>(`${this.loan(loanId)}/preview`, { params: new HttpParams().set('asOf', asOf) });
  }
  getAssessments(loanId: number, after = 0, limit = 100): Observable<AssessmentSummary[]> {
    return this.http.get<AssessmentSummary[]>(`${this.loan(loanId)}/assessments`, {
      params: this.page(after, limit)
    });
  }
  getAssessment(loanId: number, recordId: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.loan(loanId)}/assessments/${encodeURIComponent(recordId)}`);
  }
  getAccountingPolicy(loanId: number): Observable<PolicyResolution> {
    return this.http.get<PolicyResolution>(`${this.loan(loanId)}/accounting-policy`);
  }
  getAccountingPolicies(loanId: number, after = 0, limit = 100): Observable<PolicyEvent[]> {
    return this.http.get<PolicyEvent[]>(`${this.loan(loanId)}/accounting-policies`, {
      params: this.page(after, limit)
    });
  }
  getAccountingPolicyEvent(loanId: number, recordId: string): Observable<PolicyEvent> {
    return this.http.get<PolicyEvent>(`${this.loan(loanId)}/accounting-policies/${encodeURIComponent(recordId)}`);
  }
  getReclassificationHistory(loanId: number): Observable<ReclassificationEvidence> {
    return this.http.get<ReclassificationEvidence>(`${this.loan(loanId)}/reclassification-history`);
  }
  getWriteOffReconciliation(loanId: number, assessmentId?: string): Observable<CorrectionReview> {
    return this.http.get<CorrectionReview>(`${this.loan(loanId)}/writeoff-reconciliation`, {
      params: assessmentId ? new HttpParams().set('assessmentId', assessmentId) : new HttpParams()
    });
  }
  getReconciliationAssessments(loanId: number, after = 0, limit = 100): Observable<ControlRecord<CorrectionReview>[]> {
    return this.http.get<ControlRecord<CorrectionReview>[]>(`${this.loan(loanId)}/reconciliation-assessments`, {
      params: this.page(after, limit)
    });
  }
  getReconciliationAssessment(loanId: number, recordId: string): Observable<ControlRecord<CorrectionReview>> {
    return this.http.get<ControlRecord<CorrectionReview>>(
      `${this.loan(loanId)}/reconciliation-assessments/${encodeURIComponent(recordId)}`
    );
  }
  getAdjustments(loanId: number, after = 0, limit = 100): Observable<ControlRecord<AdjustmentProposal>[]> {
    return this.http.get<ControlRecord<AdjustmentProposal>[]>(`${this.loan(loanId)}/adjustments`, {
      params: this.page(after, limit)
    });
  }
  getAdjustment(loanId: number, recordId: string): Observable<ControlRecord<AdjustmentProposal>> {
    return this.http.get<ControlRecord<AdjustmentProposal>>(
      `${this.loan(loanId)}/adjustments/${encodeURIComponent(recordId)}`
    );
  }
  saveAssessment(loanId: number, request: SaveAssessmentRequest): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.loan(loanId)}/assessments`, request);
  }
  createAccountingPolicyDraft(loanId: number, request: PolicyDraftRequest): Observable<PolicyEvent> {
    return this.http.post<PolicyEvent>(`${this.loan(loanId)}/accounting-policies`, request);
  }
  approveAccountingPolicy(
    loanId: number,
    policyId: string,
    request: PolicyApprovalRequest
  ): Observable<ControlRecord<PolicyApproval>> {
    return this.http.post<ControlRecord<PolicyApproval>>(
      `${this.loan(loanId)}/accounting-policies/${encodeURIComponent(policyId)}/approvals`,
      request
    );
  }
  saveReconciliationAssessment(
    loanId: number,
    request: ReconciliationRequest
  ): Observable<ControlRecord<CorrectionReview>> {
    return this.http.post<ControlRecord<CorrectionReview>>(`${this.loan(loanId)}/reconciliation-assessments`, request);
  }
  createAdjustmentProposal(loanId: number, request: ProposalRequest): Observable<ControlRecord<AdjustmentProposal>> {
    return this.http.post<ControlRecord<AdjustmentProposal>>(`${this.loan(loanId)}/adjustment-proposals`, request);
  }
}
