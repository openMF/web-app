/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type AcquisitionStageCode = 'ONBOARDING' | 'COMPLIANCE' | 'APPROVAL' | 'ACTIVATION' | 'DEPOSIT' | 'WITHDRAWAL';

export type AcquisitionStageStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'PENDING'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'CLOSED'
  | 'FAILED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | (string & {});

export interface AcquisitionStageDetails {
  source?: string | null;
  sourceStatus?: string | null;
  actorId?: number | null;
  actorName?: string | null;
  sourceReference?: string | null;
  reason?: string | null;
  transactionId?: number | null;
  amount?: number | null;
  currencyCode?: string | null;
  accountStatus?: string | null;
}

export interface AcquisitionStage {
  code: AcquisitionStageCode;
  name: string;
  status: AcquisitionStageStatus;
  completedOn?: string | null;
  details?: AcquisitionStageDetails | null;
}

export interface AcquisitionBoard {
  clientId: number;
  accountId: number;
  prospectId?: number | null;
  currentStage?: AcquisitionStageCode | null;
  stages: AcquisitionStage[];
}
