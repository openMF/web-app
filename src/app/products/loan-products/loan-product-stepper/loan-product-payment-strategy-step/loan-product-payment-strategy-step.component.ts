import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-loan-product-payment-strategy-step',
  templateUrl: './loan-product-payment-strategy-step.component.html',
  styleUrls: ['./loan-product-payment-strategy-step.component.scss']
})
export class LoanProductPaymentStrategyStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  loanProductPaymentStrategyForm: FormGroup;

  transactionTypesData: any = [];
  transactionTypeOptions: any = [];

  transactionType = new FormControl('', Validators.required);

  stepOrderHasChanged = false;
  @ViewChild('table') table: MatTable<any>;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = ['transactionName', 'transactionOrder', 'actions'];

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog) {
      this.createForm();
  }

  ngOnInit(): void {
    this.transactionTypesData = [];
  }

  createForm(): void {
    this.loanProductPaymentStrategyForm = this.formBuilder.group({
      'transactionType': ['', Validators.required],
    });
  }

  addTransactionType(): void {
    console.log(this.transactionType.value);
    this.transactionTypesData.append(this.transactionType.value);
  }

  removeTransactionType(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.transactionTypesData.splice(index, 1);
        this.transactionTypesData = this.transactionTypesData.concat([]);
        this.transactionTypesData = [...this.transactionTypesData];
        this.stepOrderHasChanged = true;
      }
    });
  }


  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.transactionTypesData.findIndex((d: any) => d === event.item.data);
    moveItemInArray(this.transactionTypesData, prevIndex, event.currentIndex);
    this.transactionTypesData = [...this.transactionTypesData];
    this.table.renderRows();
    this.stepOrderHasChanged = true;
  }


}
