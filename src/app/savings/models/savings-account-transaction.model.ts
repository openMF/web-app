import { Currency } from 'app/shared/models/general.model';

export interface SavingsAccountTransaction {
  id: number;
  transactionType: SavingsAccountTransactionType;
  entryType: string;
  accountId: number;
  accountNo: string;
  date: number[];
  currency: Currency;
  amount: number;
  runningBalance: number;
  reversed: boolean;
  transfer: Transfer;
  submittedOnDate: number[];
  interestedPostedAsOn: boolean;
  submittedByUsername: string;
  isManualTransaction: boolean;
  isReversal: boolean;
  originalTransactionId: number;
  lienTransaction: boolean;
  releaseTransactionId: number;
  chargesPaidByData: any[];
}

export interface SavingsAccountTransactionType {
  id: number;
  code: string;
  value: string;
  deposit: boolean;
  dividendPayout: boolean;
  withdrawal: boolean;
  interestPosting: boolean;
  feeDeduction: boolean;
  initiateTransfer: boolean;
  approveTransfer: boolean;
  withdrawTransfer: boolean;
  rejectTransfer: boolean;
  overdraftInterest: boolean;
  writtenoff: boolean;
  overdraftFee: boolean;
  withholdTax: boolean;
  escheat: boolean;
  amountHold: boolean;
  amountRelease: boolean;
  accrual: boolean;
}

export interface Transfer {
  id: number;
  reversed: boolean;
  currency: Currency;
  transferAmount: number;
  transferDate: number[];
  transferDescription: string;
}
