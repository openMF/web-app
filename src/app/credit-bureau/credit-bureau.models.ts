/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface KycReadinessResult {
  clientId: number;
  score: number;
  ready: boolean;
  missingFields: string[];
  ficoScore: number | null;
  riskBand: string | null;
  scoreDropAlert: boolean;
  pulledAt: string | null;
}

export interface BureauResponseDTO {
  id: number;
  clientId: number;
  bureauType: string;
  ficoScore: number | null;
  riskBand: string | null;
  hasDelinquencies: boolean;
  scoreDropAlert: boolean;
  tradelines: string | null;
  alerts: string | null;
  pulledAt: string | null;
  expiryDate: string | null;
  dateOfFirstDelinquency: string | null;
}

export interface AuditEntryDTO {
  id: number;
  clientId: number;
  action: string;
  entityType: string;
  performedBy: string;
  requestId: string;
  result: string;
  durationMs: number;
  createdAt: string;
}

export interface PagedResult<T> {
  _embedded: { [key: string]: T[] };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface SubmissionRecord {
  id: number;
  clientId: number;
  loanId: number | null;
  triggerType: string;
  status: string;
  rejectionReason: string | null;
  retryCount: number;
  submittedAt: string | null;
  cdcReferenceId: string | null;
  inquiryType: string | null;
  expiryDate: string | null;
  createdAt: string;
}

export interface SubmissionRunResponse {
  message: string;
  clientCount: number;
}

export interface DisputeCase {
  id: number;
  submissionRecordId: number;
  status: string;
  disputeDetails: string;
  raisedBy: string;
  openedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  expiryDate: string | null;
  institutionDataSummary: string | null;
  cdcDataSummary: string | null;
}

export interface AuditParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}

export type CbildRole = 'KYC_OFFICER' | 'CREDIT_ANALYST' | 'COMPLIANCE';

export const CBILD_ROLE_LABELS: Record<CbildRole, string> = {
  KYC_OFFICER: 'KYC Officer',
  CREDIT_ANALYST: 'Credit Analyst',
  COMPLIANCE: 'Compliance'
};
