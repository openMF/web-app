export interface LoanTransactionType {
  id: number;
  code: string;
  value: string;

  accrual: boolean;
  approveTransfer: boolean;
  chargeAdjustment: boolean;
  chargePayment: boolean;
  chargeRefund: boolean;
  chargeback: boolean;
  chargeoff: boolean;
  contra: boolean;
  creditBalanceRefund: boolean;
  disbursement: boolean;
  goodwillCredit: boolean;
  initiateTransfer: boolean;
  merchantIssuedRefund: boolean;
  payoutRefund: boolean;
  recoveryRepayment: boolean;
  refund: boolean;
  refundForActiveLoans: boolean;
  rejectTransfer: boolean;
  repayment: boolean;
  repaymentAtDisbursement: boolean;
  waiveCharges: boolean;
  waiveInterest: boolean;
  withdrawTransfer: boolean;
  writeOff: boolean;
}
