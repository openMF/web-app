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

export interface JLGGroupData {
  dueDate: number[];
  loanProducts: any[];
  savingsProducts: any[];
  groups: any[];
  attendanceTypeOptions: AttendanceTypeOption[];
  paymentTypeOptions: PaymentTypeOption[];
}

export interface AttendanceTypeOption {
  id: number;
  code: string;
  value: string;
}
