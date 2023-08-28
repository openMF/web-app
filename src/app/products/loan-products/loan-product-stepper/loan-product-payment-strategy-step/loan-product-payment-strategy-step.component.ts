import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

interface PaymentCode {
  name: string;
  code: string;
}

interface PaymentAllocationOrder {
  paymentAllocationRule: string;
  order: number;
}

export interface PaymentAllocation {
  transactionType: string;
  paymentAllocationOrder: PaymentAllocationOrder[];
  futureInstallmentAllocationRule: string;
}

@Component({
  selector: 'mifosx-loan-product-payment-strategy-step',
  templateUrl: './loan-product-payment-strategy-step.component.html',
  styleUrls: ['./loan-product-payment-strategy-step.component.scss']
})
export class LoanProductPaymentStrategyStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Output() paymentAllocation = new EventEmitter<PaymentAllocation[]>();
  @Output() paymentAllocationChange = new EventEmitter<boolean>();

  transactionTypesData: PaymentCode[] = [];
  transactionTypeOptions: PaymentCode[] = [];
  installmentAllocationOptions: PaymentCode[] = [];

  transactionType = new FormControl('');
  futureInstallmentAllocationRule = new FormControl('', Validators.required);

  @ViewChild('table') table: MatTable<any>;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = ['order', 'transactionName'];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.transactionTypesData = [];
    this.setOptions();
    this.sendPaymentAllocation();
  }

  setOptions(): void {
    this.transactionTypeOptions = [
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
    this.transactionTypesData = this.transactionTypeOptions;

    this.installmentAllocationOptions = [
      { name: 'Next Installment', code: 'NEXT_INSTALLMENT' },
      { name: 'Last Installment', code: 'LAST_INSTALLMENT' },
      { name: 'Reamortization', code: 'REAMORTIZATION' }
    ];

    this.futureInstallmentAllocationRule.patchValue('NEXT_INSTALLMENT');
  }

  addTransactionType(): void {
    this.transactionTypeOptions.forEach((txType: PaymentCode) => {
      if (txType.code === this.transactionType.value) {
        this.transactionTypesData = [
          ...this.transactionTypesData,
          txType
        ];
        this.sendPaymentAllocation();
        this.removePaymentCode(txType);
        this.resetTransactionType();
      }
    });
  }

  removePaymentCode(txType: PaymentCode): void {
    this.transactionTypeOptions = this.transactionTypeOptions.filter(({ code }) => code !== txType.code);
  }

  resetTransactionType(): void {
    this.transactionType.patchValue('');
    this.transactionType.markAsUntouched();
  }

  removeTransactionType(index: number) {
    const transactionTypeName = this.transactionTypesData[index].name;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: transactionTypeName }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.transactionTypesData.splice(index, 1);
        this.transactionTypesData = this.transactionTypesData.concat([]);
        this.transactionTypesData = [...this.transactionTypesData];
        this.sendPaymentAllocation();
      }
    });
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.transactionTypesData.findIndex((d: any) => d === event.item.data);
    moveItemInArray(this.transactionTypesData, prevIndex, event.currentIndex);
    this.transactionTypesData = [...this.transactionTypesData];
    this.table.renderRows();
    this.sendPaymentAllocation();
    this.paymentAllocationChange.emit(true);
  }

  sendPaymentAllocation(): void {
    const paymentAllocationOrder: PaymentAllocationOrder[] = [];
    this.transactionTypesData.forEach((txType: PaymentCode, index: number) => {
      paymentAllocationOrder.push({ 'paymentAllocationRule': txType.code, order: (index + 1) });
    });

    const paymentAllocation: PaymentAllocation[] = [];
    paymentAllocation.push({
      'futureInstallmentAllocationRule': this.futureInstallmentAllocationRule.value,
      'transactionType': 'DEFAULT',
      'paymentAllocationOrder': paymentAllocationOrder
    });

    this.paymentAllocation.emit(paymentAllocation);
  }

}
