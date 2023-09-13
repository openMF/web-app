import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AdvancedPaymentAllocation, AdvancedPaymentStrategy, PaymentAllocation, PaymentAllocationOrder, PaymentAllocationTransactionType } from './payment-allocation-model';
import { MatDialog } from '@angular/material/dialog';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'mifosx-loan-product-payment-strategy-step',
  templateUrl: './loan-product-payment-strategy-step.component.html',
  styleUrls: ['./loan-product-payment-strategy-step.component.scss']
})
export class LoanProductPaymentStrategyStepComponent implements OnInit {

  @Input() advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  @Input() advancedPaymentAllocationTransactionTypes: PaymentAllocationTransactionType[] = [];
  @Input() paymentAllocationOrderDefault: PaymentAllocationOrder[];

  @Output() paymentAllocationChange = new EventEmitter<boolean>();
  @Output() setPaymentAllocation = new EventEmitter<PaymentAllocation[]>();

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(private dialog: MatDialog,
    private advancedPaymentStrategy: AdvancedPaymentStrategy) { }

  ngOnInit(): void { }

  sendPaymentAllocation(): void {
    const data = this.advancedPaymentStrategy.buildPaymentAllocations(this.advancedPaymentAllocations);
    this.setPaymentAllocation.emit(data);
  }

  paymentAllocationChanged(changed: boolean): void {
    this.paymentAllocationChange.emit(changed);
    this.sendPaymentAllocation();
  }

  addTransaction(): void {
    const transactionTypesCurrent: String[] = [];
    this.advancedPaymentAllocations.forEach((item: AdvancedPaymentAllocation) => {
      transactionTypesCurrent.push(item.transaction.code);
    });

    const transactionTypesOptions: PaymentAllocationTransactionType[] = [];
    this.advancedPaymentAllocationTransactionTypes.forEach((option: PaymentAllocationTransactionType) => {
      if (!this.advancedPaymentStrategy.isDefault(option) && transactionTypesCurrent.indexOf(option.code) < 0) {
        transactionTypesOptions.push(option);
      }
    });

    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'code',
        label: 'Transaction Type',
        options: { label: 'code', value: 'code', data: transactionTypesOptions },
        order: 1
      })
    ];
    const data = {
      title: 'Advanced Payment Allocation Transaction Type',
      layout: { addButtonText: 'Add' },
      formfields: formfields
    };
    const transactionTypeDialogRef = this.dialog.open(FormDialogComponent, { data });
    transactionTypeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const defaultPaymentAllocation: AdvancedPaymentAllocation = this.advancedPaymentAllocations[0];
        transactionTypesOptions.forEach((transactionType: PaymentAllocationTransactionType) => {
          if (transactionType.code === response.data.value.code) {
            this.advancedPaymentAllocations.push(
              this.advancedPaymentStrategy.buildAdvancedPaymentAllocation(true, transactionType,
                this.paymentAllocationOrderDefault,
                defaultPaymentAllocation.futureInstallmentAllocationRules)
            );
            this.paymentAllocationChange.emit(true);
            this.tabGroup.selectedIndex = (this.advancedPaymentAllocations.length - 1);
            this.sendPaymentAllocation();
          }
        });
      }
    });
  }

  transactionTypeRemoved(transaction: PaymentAllocationTransactionType): void {
    this.advancedPaymentAllocations.forEach((item: AdvancedPaymentAllocation, index: number) => {
      if (item.transaction.code === transaction.code) {
        this.advancedPaymentAllocations.splice(index, 1);
        this.paymentAllocationChange.emit(true);
        this.tabGroup.selectedIndex = (index - 1);
        this.sendPaymentAllocation();
      }
    });
  }

}
