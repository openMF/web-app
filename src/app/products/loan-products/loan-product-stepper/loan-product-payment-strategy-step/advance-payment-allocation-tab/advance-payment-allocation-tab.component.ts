import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AdvancedCreditAllocation, AdvancedPaymentAllocation, AdvancedPaymentStrategy, CreditAllocationOrder, FutureInstallmentAllocationRule, PaymentAllocationOrder, PaymentAllocationTransactionType } from '../payment-allocation-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-advance-payment-allocation-tab',
  templateUrl: './advance-payment-allocation-tab.component.html',
  styleUrls: ['./advance-payment-allocation-tab.component.scss']
})
export class AdvancePaymentAllocationTabComponent implements OnInit {

  @Input() advancedPaymentAllocation: AdvancedPaymentAllocation;
  @Input() advancedCreditAllocation: AdvancedCreditAllocation;

  @Output() allocationChanged = new EventEmitter<boolean>();
  @Output() transactionTypeRemoved = new EventEmitter<PaymentAllocationTransactionType>();

  paymentAllocationsData: PaymentAllocationOrder[] | null = null;
  creditAllocationsData: CreditAllocationOrder[] | null = null;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = ['actions', 'order', 'allocationRule'];

  futureInstallmentAllocationRule = new UntypedFormControl('', Validators.required);

  @ViewChild('table') table: MatTable<any>;

  constructor(private dialog: MatDialog,
    private advancedPaymentStrategy: AdvancedPaymentStrategy) { }

  ngOnInit(): void {
    if (this.advancedCreditAllocation) {
      this.creditAllocationsData = this.advancedCreditAllocation?.creditAllocationOrder;
    }

    if (this.advancedPaymentAllocation) {
      this.paymentAllocationsData = this.advancedPaymentAllocation?.paymentAllocationOrder;

      if (this.advancedPaymentAllocation.futureInstallmentAllocationRule) {
        this.futureInstallmentAllocationRule.patchValue(this.advancedPaymentAllocation.futureInstallmentAllocationRule.code);
      }
      this.futureInstallmentAllocationRule.valueChanges.subscribe((value: any) => {
        this.advancedPaymentAllocation.futureInstallmentAllocationRules.forEach((item: FutureInstallmentAllocationRule) => {
          if (value === item.code) {
            this.advancedPaymentAllocation.futureInstallmentAllocationRule = item;
            this.allocationChanged.emit(true);
          }
        });
      });
    }
  }

  dropTable(event: CdkDragDrop<any[]>, credit: boolean) {
    if (!credit) {
      const prevIndex = this.paymentAllocationsData.findIndex((d: any) => d === event.item.data);
      moveItemInArray(this.paymentAllocationsData, prevIndex, event.currentIndex);
      this.paymentAllocationsData = [...this.paymentAllocationsData];
      this.advancedPaymentAllocation.paymentAllocationOrder = this.paymentAllocationsData;
      this.table.renderRows();
      this.allocationChanged.emit(true);
    } else {
      const prevIndex = this.creditAllocationsData.findIndex((d: any) => d === event.item.data);
      moveItemInArray(this.creditAllocationsData, prevIndex, event.currentIndex);
      this.creditAllocationsData = [...this.creditAllocationsData];
      this.advancedCreditAllocation.creditAllocationOrder = this.creditAllocationsData;
      this.table.renderRows();
      this.allocationChanged.emit(true);
    }
  }

  isDefault(): boolean {
    if (this.advancedPaymentAllocation && this.advancedPaymentAllocation.transaction) {
      return this.advancedPaymentStrategy.isDefault(this.advancedPaymentAllocation.transaction);
    }
    return false;
  }

  removeTransaction(): void {
    let transaction: PaymentAllocationTransactionType = null;
    if (this.advancedPaymentAllocation && this.advancedPaymentAllocation.transaction) {
      transaction = this.advancedPaymentAllocation.transaction;
    } else if (this.advancedCreditAllocation && this.advancedCreditAllocation.transaction) {
      transaction = this.advancedCreditAllocation.transaction;
      transaction.credit = true;
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: ` the Transaction Type ${transaction.value}` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.transactionTypeRemoved.emit(transaction);
      }
    });
  }

}
