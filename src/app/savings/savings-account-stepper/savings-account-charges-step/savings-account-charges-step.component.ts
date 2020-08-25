/** Angular Imports */
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';

/**
 * Savings Account Charges Step
 */
@Component({
  selector: 'mifosx-savings-account-charges-step',
  templateUrl: './savings-account-charges-step.component.html',
  styleUrls: ['./savings-account-charges-step.component.scss']
})
export class SavingsAccountChargesStepComponent implements OnInit, OnChanges {

  /** Savings Account Product Template */
  @Input() savingsAccountProductTemplate: any;
  /** Savings Account Template */
  @Input() savingsAccountTemplate: any;
  /** Currency Code */
  @Input() currencyCode: FormControl;

  /** Charge Data */
  chargeData: any = [];
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  /** For Edit Savings Account Form */
  isChargesPatched = false;
  /** Display columns for charges table */
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date', 'repaymentsEvery', 'action'];

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(public dialog: MatDialog,
              private datePipe: DatePipe) {}

   ngOnInit() {
    this.currencyCode.valueChanges.subscribe(() => {
      if (!this.isChargesPatched && this.savingsAccountTemplate.charges) {
        this.chargesDataSource = this.savingsAccountTemplate.charges.map((charge: any) => ({...charge, id: charge.chargeId})) || [];
        this.isChargesPatched = true;
      } else {
        this.chargesDataSource = [];
      }
    });
   }

   ngOnChanges() {
    if (this.savingsAccountProductTemplate) {
      this.chargeData = this.savingsAccountProductTemplate.chargeOptions;
    }
   }

  /**
   * Adds the charge to charges table
   * @param {any} charge Charge
   */
  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
    this.pristine = false;
  }

  /**
   * Edits the Charge Amount
   * @param {any} charge Charge
   */
  editChargeAmount(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: charge.amount,
        type: 'number',
        required: false
      }),
    ];
    const data = {
      title: 'Edit Charge Amount',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const newCharge = { ...charge, amount: response.data.value.amount };
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Edits the Charge Date
   * @param {any} charge Charge
   */
  editChargeDate(charge: any) {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'date',
        label: 'Date',
        value: charge.dueDate || charge.feeOnMonthDay || '',
        type: 'datetime-local',
        required: false
      }),
    ];
    const data = {
      title: 'Edit Charge Date',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        let newCharge: any;
        const dateFormat = 'dd MMMM yyyy';
        const date = this.datePipe.transform(response.data.value.date, dateFormat);
        switch (charge.chargeTimeType.value) {
          case 'Specified due date':
          case 'Weekly Fee':
          newCharge = { ...charge, dueDate: date };
          break;
          case 'Annual Fee':
          newCharge = { ...charge, feeOnMonthDay: date };
          break;
        }
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Edits the Charge Fee Interval
   * @param {any} charge Charge
   */
  editChargeFeeInterval(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'feeInterval',
        label: 'Fee Interval',
        value: charge.feeInterval,
        type: 'text',
        required: false
      }),
    ];
    const data = {
      title: 'Edit Charge Fee Interval',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const newCharge = { ...charge, feeInterval: response.data.value.feeInterval };
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Removes the charge from charges table
   * @param {any} charge Charge
   */
  deleteCharge(charge: any) {
    this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
    this.chargesDataSource = this.chargesDataSource.concat([]);
    this.pristine = false;
  }

  /**
   * Returns savings account charges
   */
  get savingsAccountCharges() {
    return { charges: this.chargesDataSource };
  }

}
