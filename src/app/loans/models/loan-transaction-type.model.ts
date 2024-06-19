export interface LoanTransactionType {
  id:                      number;
  code:                    string;
  value:                   string;

  disbursement:            boolean;
  repaymentAtDisbursement: boolean;
  repayment:               boolean;
  merchantIssuedRefund:    boolean;
  payoutRefund:            boolean;
  goodwillCredit:          boolean;
  interestPaymentWaiver:   boolean;
  chargeRefund:            boolean;
  contra:                  boolean;
  waiveInterest:           boolean;
  waiveCharges:            boolean;
  accrual:                 boolean;
  writeOff:                boolean;
  recoveryRepayment:       boolean;
  initiateTransfer:        boolean;
  approveTransfer:         boolean;
  withdrawTransfer:        boolean;
  rejectTransfer:          boolean;
  chargePayment:           boolean;
  refund:                  boolean;
  refundForActiveLoans:    boolean;
  creditBalanceRefund:     boolean;
  chargeAdjustment:        boolean;
  chargeback:              boolean;
  chargeoff:               boolean;
  downPayment:             boolean;
  reAge:                   boolean;
  reAmortize:              boolean;
}
