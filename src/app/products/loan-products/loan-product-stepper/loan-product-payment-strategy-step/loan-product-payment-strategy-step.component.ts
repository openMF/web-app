import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { FutureInstallmentAllocationRules, PaymentAllocation, PaymentAllocationOrder, PaymentAllocationTransactionType, PaymentAllocationTransactionTypes, PaymentAllocationTypes, PaymentCode } from './payment-allocation-model';

@Component({
  selector: 'mifosx-loan-product-payment-strategy-step',
  templateUrl: './loan-product-payment-strategy-step.component.html',
  styleUrls: ['./loan-product-payment-strategy-step.component.scss']
})
export class LoanProductPaymentStrategyStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() transactionType: PaymentAllocationTransactionType;
  @Output() paymentAllocation = new EventEmitter<PaymentAllocation[]>();
  @Output() paymentAllocationChange = new EventEmitter<boolean>();

  paymentAllocationsData: PaymentCode[] = [];
  installmentAllocationOptions: PaymentCode[] = [];
  transactionTypeOptions: PaymentCode[] = [];

  transactionTypeCtrl = new UntypedFormControl('');
  futureInstallmentAllocationRule = new UntypedFormControl('', Validators.required);

  @ViewChild('table') table: MatTable<any>;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = ['paymentAllocation', 'order'];

  constructor() { }

  ngOnInit(): void {
    this.paymentAllocationsData = [];
    this.setOptions();
    this.sendPaymentAllocation();
  }

  setOptions(): void {
    this.paymentAllocationsData = PaymentAllocationTypes.options;
    this.transactionTypeOptions = PaymentAllocationTransactionTypes.options;
    this.transactionTypeCtrl.patchValue(this.transactionTypeOptions[0].code);
    if (this.transactionType) {
      this.transactionTypeCtrl.patchValue(this.transactionType.code);
    }
    this.installmentAllocationOptions = FutureInstallmentAllocationRules.options;
    this.futureInstallmentAllocationRule.patchValue(this.installmentAllocationOptions[0].code);
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.paymentAllocationsData.findIndex((d: any) => d === event.item.data);
    moveItemInArray(this.paymentAllocationsData, prevIndex, event.currentIndex);
    this.paymentAllocationsData = [...this.paymentAllocationsData];
    this.table.renderRows();
    this.sendPaymentAllocation();
    this.paymentAllocationChange.emit(true);
  }

  sendPaymentAllocation(): void {
    let transactionTypeVal = PaymentAllocationTransactionTypes.DEFAULT_TRANSACTION.code;
    if (this.transactionType) {
      transactionTypeVal = this.transactionType.code;
    }
    const paymentAllocationOrder: PaymentAllocationOrder[] = [];
    this.paymentAllocationsData.forEach((txType: PaymentCode, index: number) => {
      paymentAllocationOrder.push({ 'paymentAllocationRule': txType.code, order: (index + 1) });
    });

    const paymentAllocation: PaymentAllocation[] = [];
    paymentAllocation.push({
      'futureInstallmentAllocationRule': this.futureInstallmentAllocationRule.value,
      'transactionType': transactionTypeVal,
      'paymentAllocationOrder': paymentAllocationOrder
    });

    this.paymentAllocation.emit(paymentAllocation);
  }

}
