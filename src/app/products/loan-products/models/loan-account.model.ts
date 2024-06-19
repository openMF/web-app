import { Currency } from 'app/shared/models/general.model';

export interface LoanTransaction {
    id:                        number;
    loanId:                    number;
    officeId:                  number;
    officeName:                string;
    type:                      LoanTransactionType;
    date:                      number[];
    currency:                  Currency;
    amount:                    number;
    netDisbursalAmount:        number;
    principalPortion:          number;
    interestPortion:           number;
    feeChargesPortion:         number;
    penaltyChargesPortion:     number;
    overpaymentPortion:        number;
    unrecognizedIncomePortion: number;
    externalId:                string;
    outstandingLoanBalance:    number;
    submittedOnDate:           number[];
    manuallyReversed:          boolean;
    loanChargePaidByList:      any[];
    numberOfRepayments:        number;
    transactionRelations:      any[];
}


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
