export interface PaymentCode {
  name: string;
  code: string;
}

export interface PaymentAllocationOrder {
  paymentAllocationRule: string;
  order: number;
}

export interface PaymentAllocation {
  transactionType: string;
  paymentAllocationOrder: PaymentAllocationOrder[];
  futureInstallmentAllocationRule: string;
}

export interface PaymentAllocationTransactionType {
  name: string;
  code: string;
}

export class PaymentAllocationTransactionTypes {
  public static DEFAULT_TRANSACTION: PaymentAllocationTransactionType = { name: 'Default', code: 'DEFAULT' };

  public static options: PaymentCode[] = [
    this.DEFAULT_TRANSACTION
  ];
}

export class PaymentAllocationTypes {
  public static options: PaymentCode[] = [
    { name: 'Past due penalty', code: 'PAST_DUE_PENALTY' },
    { name: 'Past due fee', code: 'PAST_DUE_FEE' },
    { name: 'Past due principal', code: 'PAST_DUE_PRINCIPAL' },
    { name: 'Past due interest', code: 'PAST_DUE_INTEREST' },
    { name: 'Due penalty', code: 'DUE_PENALTY' },
    { name: 'Due fee', code: 'DUE_FEE' },
    { name: 'Due principal', code: 'DUE_PRINCIPAL' },
    { name: 'Due interest', code: 'DUE_INTEREST' },
    { name: 'In advance penalty', code: 'IN_ADVANCE_PENALTY' },
    { name: 'In advance fee', code: 'IN_ADVANCE_FEE' },
    { name: 'In advance principal', code: 'IN_ADVANCE_PRINCIPAL' },
    { name: 'In advance interest', code: 'IN_ADVANCE_INTEREST' }
    ];
}

export class FutureInstallmentAllocationRules {
  public static options: PaymentCode[] = [
    { name: 'Next Installment', code: 'NEXT_INSTALLMENT' },
    { name: 'Last Installment', code: 'LAST_INSTALLMENT' },
    { name: 'Reamortization', code: 'REAMORTIZATION' }
  ];
}
