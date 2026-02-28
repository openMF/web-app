/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PaymentTypeOption } from 'app/shared/models/general.model';

export interface CollectionSheetData {
  staffId: number;
  staffName: string;
  meetingFallCenters: MeetingFallCenter[];
}

export interface MeetingFallCenter {
  id: number;
  accountNo: string;
  name: string;
  officeId: number;
  staffId: number;
  staffName: string;
  hierarchy: string;
  status: Status;
  active: boolean;
  activationDate: number[];
  collectionMeetingCalendar: CollectionMeetingCalendar;
  totalCollected: number;
  totalOverdue: number;
  totaldue: number;
  installmentDue: number;
}

export interface CollectionMeetingCalendar {
  id: number;
  calendarInstanceId: number;
  entityId: number;
  entityType: Status;
  title: string;
  startDate: number[];
  repeating: boolean;
  recurrence: string;
}

export interface Status {
  id: number;
  code: string;
  value: string;
}

export interface CollectionLoan {
  loanId: number;
  productId: number;
  productName?: string;
  accountNo?: string;
  totalDue: number;
  chargesDue?: number;
  installmentDue?: number;
}

export interface CollectionSavings {
  savingsId: number;
  productId: number;
  productName?: string;
  accountNo?: string;
  dueAmount: number;
}

export interface CollectionCharge {
  chargeId: number;
  chargeName: string;
  amount: number;
}

export interface CollectionClient {
  clientId: number;
  clientName?: string;
  attendanceType?: AttendanceTypeOption;
  loans?: CollectionLoan[];
  savings?: CollectionSavings[];
  clientCharges?: CollectionCharge[];
}

export interface CollectionGroup {
  groupId: number;
  groupName?: string;
  clients: CollectionClient[];
}

export interface JLGGroupData {
  dueDate: number[];
  loanProducts: { id: number; name: string }[];
  savingsProducts: { id: number; name: string }[];
  groups: CollectionGroup[];
  attendanceTypeOptions: AttendanceTypeOption[];
  paymentTypeOptions: PaymentTypeOption[];
}

export interface AttendanceTypeOption {
  id: number;
  code: string;
  value: string;
}

/** Attendance type constants matching Fineract backend enum values */
export const AttendanceType = {
  PRESENT: 1,
  ABSENT: 2,
  APPROVED_LEAVE: 3,
  LATE: 4
} as const;
