export interface LoanStatus {
  id: number;
  code: string;
  value: string;

  active: boolean;
  closed: boolean;
  closedObligationsMet: boolean;
  closedRescheduled: boolean;
  closedWrittenOff: boolean;
  overpaid: boolean;
  pendingApproval: boolean;
  waitingForDisbursal: boolean;
}
