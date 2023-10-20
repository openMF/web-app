import { Injectable } from '@angular/core';

export interface PaymentAllocationTransactionType {
  id: number;
  value: string;
  code: string;
}

export interface PaymentAllocationType {
  id: number;
  value: string;
  code: string;
}

export interface FutureInstallmentAllocationRule {
  id: number;
  value: string;
  code: string;
}

export interface PaymentAllocationOrder {
  id?: number;
  paymentAllocationRule: string;
  order: number;
}

export interface PaymentAllocation {
  transactionType: string;
  paymentAllocationOrder: PaymentAllocationOrder[];
  futureInstallmentAllocationRule: string;
}

export class PaymentAllocationTransactionTypes {
  public static DEFAULT_TRANSACTION: PaymentAllocationTransactionType = { id: 1, value: 'Default', code: 'DEFAULT' };
}

export class AdvancedPaymentAllocation {
  transaction: PaymentAllocationTransactionType;
  paymentAllocationOrder: PaymentAllocationOrder[];
  futureInstallmentAllocationRule: FutureInstallmentAllocationRule;
  futureInstallmentAllocationRules: FutureInstallmentAllocationRule[];
}

export class AdvancePaymentAllocationData {
  transactionTypes: PaymentAllocationTransactionType[];
  allocationTypes: PaymentAllocationType[];
  futureInstallmentAllocationRules: FutureInstallmentAllocationRule[];
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedPaymentStrategy {

  public buildAdvancedPaymentAllocationList(loanProduct: any): AdvancedPaymentAllocation[] {
    const advancedPaymentAllocation: AdvancedPaymentAllocation[] = [];
    const advancedPaymentAllocationTransactionTypes: PaymentAllocationTransactionType[] =
      loanProduct.advancedPaymentAllocationTransactionTypes;
    const advancedPaymentAllocationTypes: PaymentAllocationOrder[] = loanProduct.advancedPaymentAllocationTypes;
    const advancedPaymentAllocationFutureInstallmentAllocationRules: FutureInstallmentAllocationRule[] =
      loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules;
    if (loanProduct.paymentAllocation) {
      loanProduct.paymentAllocation.forEach((item: PaymentAllocation) => {
        advancedPaymentAllocation.push({
          transaction: this.getItemByCode(item.transactionType, advancedPaymentAllocationTransactionTypes),
          paymentAllocationOrder: this.buildCurrentPaymentAllocationOrder(item.paymentAllocationOrder,
            advancedPaymentAllocationTypes),
          futureInstallmentAllocationRule: this.getItemByCode(item.futureInstallmentAllocationRule,
            advancedPaymentAllocationFutureInstallmentAllocationRules),
          futureInstallmentAllocationRules: advancedPaymentAllocationFutureInstallmentAllocationRules,
        });
      });
    }
    // If this is Empty, add the Default
    if (advancedPaymentAllocation.length === 0) {
      advancedPaymentAllocation.push({
        transaction: PaymentAllocationTransactionTypes.DEFAULT_TRANSACTION,
        paymentAllocationOrder: this.buildPaymentAllocationTransactionOrder(true, [], loanProduct.advancedPaymentAllocationTypes),
        futureInstallmentAllocationRule: loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules[0],
        futureInstallmentAllocationRules: loanProduct.advancedPaymentAllocationFutureInstallmentAllocationRules,
      });
    }
    return advancedPaymentAllocation;
  }

  public buildAdvancedPaymentAllocation(forDefault: boolean, transaction: PaymentAllocationTransactionType,
    currentItems: PaymentAllocationOrder[],
    futureInstallmentAllocationRules: FutureInstallmentAllocationRule[]): AdvancedPaymentAllocation {
    return {
      transaction: transaction,
      paymentAllocationOrder: this.buildPaymentAllocationTransactionOrder(forDefault, currentItems, currentItems),
      futureInstallmentAllocationRule: futureInstallmentAllocationRules[0],
      futureInstallmentAllocationRules: futureInstallmentAllocationRules,
    };
  }

  public buildPaymentAllocationTransactionOrder(forDefault: boolean, currentItems: PaymentAllocationOrder[], defaultItems: PaymentAllocationOrder[]): PaymentAllocationOrder[] {
    const paymentAllocationOrder: PaymentAllocationOrder[] = [];
    if (forDefault) {
      return defaultItems;
    } else {
      currentItems.forEach((currentItem: PaymentAllocationOrder) => {
        defaultItems.forEach((item: PaymentAllocationOrder) => {
          if (currentItem.id === item.id) {
            paymentAllocationOrder.push(item);
          }
        });
      });
    }
    return paymentAllocationOrder;
  }

  public buildPaymentAllocations(advancedPaymentAllocations: AdvancedPaymentAllocation[]): PaymentAllocation[] {
    const paymentAllocations: PaymentAllocation[] = [];
    advancedPaymentAllocations.forEach((paymentAllocation: AdvancedPaymentAllocation) => {
      paymentAllocations.push({
        transactionType: paymentAllocation.transaction.code,
        paymentAllocationOrder: this.buildPaymentAllocationOrder(paymentAllocation.paymentAllocationOrder),
        futureInstallmentAllocationRule: paymentAllocation.futureInstallmentAllocationRule.code
      });
    });

    return paymentAllocations;
  }

  public buildPaymentAllocationOrder(paymentAllocationOrder: PaymentAllocationOrder[]): PaymentAllocationOrder[] {
    const paymentAllocations: any[] = [];
    paymentAllocationOrder.forEach((item: any, index: number) => {
      paymentAllocations.push({
        order: (index + 1),
        paymentAllocationRule: item.code
      });
    });

    return paymentAllocations;
  }

  public buildCurrentPaymentAllocationOrder(currentItems: any[], defaultItems: PaymentAllocationOrder[]):
    PaymentAllocationOrder[] {
      const paymentAllocationOrder: PaymentAllocationOrder[] = [];
      currentItems.forEach((item: any) => {
        paymentAllocationOrder.push(this.getItemByCode(item.paymentAllocationRule, defaultItems));
      });
      return paymentAllocationOrder;
  }

  public getItemByCode(code: string,
      options: any[]): any {
    let transaction: any;
    options.forEach((option: any) => {
      if (option.code === code) {
        transaction = option;
      }
    });
    return transaction;
  }

  public isDefault(transaction: PaymentAllocationTransactionType): boolean {
    return (transaction.code === PaymentAllocationTransactionTypes.DEFAULT_TRANSACTION.code);
  }

}
