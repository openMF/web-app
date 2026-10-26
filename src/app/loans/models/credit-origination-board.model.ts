/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type CreditOriginationStageCode =
  | 'ONBOARDING'
  | 'COMPLIANCE'
  | 'PARAMETRIC_SCORE'
  | 'FILE_INTEGRATION'
  | 'CREDIT_ANALYSIS'
  | 'APPROVAL'
  | 'LEGAL_INSTRUMENTATION'
  | 'DISBURSEMENT'
  | 'RECOVERY';

export type CreditOriginationStageStatus =
  'COMPLETED' | 'CURRENT' | 'PENDING' | 'REJECTED' | 'BLOCKED' | 'FAILED' | 'CANCELLED' | 'WITHDRAWN' | 'WRITTEN_OFF';

export interface CreditOriginationStageDetails {
  source?: string | null;
  sourceStatus?: string | null;
  actorId?: number | null;
  actorName?: string | null;
  sourceReference?: string | null;
  reason?: string | null;
  transactionId?: number | null;
  amount?: number | null;
  currencyCode?: string | null;
  loanStatus?: string | null;
}

export interface CreditOriginationStage {
  code: CreditOriginationStageCode;
  displayName: string;
  status: CreditOriginationStageStatus;
  completedOn?: string | null;
  details?: CreditOriginationStageDetails | null;
}

export interface CreditOriginationBoard {
  creditApplicationId: number;
  clientId: number;
  loanId: number;
  prospectId?: number | null;
  currentStage?: CreditOriginationStageCode | null;
  stages: CreditOriginationStage[];
}
