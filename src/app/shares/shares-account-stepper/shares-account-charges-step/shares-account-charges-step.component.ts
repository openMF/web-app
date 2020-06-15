/** Angular Imports */
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/**
 * Shares Account Charges Step
 */
@Component({
  selector: 'mifosx-shares-account-charges-step',
  templateUrl: './shares-account-charges-step.component.html',
  styleUrls: ['./shares-account-charges-step.component.scss']
})
export class SharesAccountChargesStepComponent implements OnInit, OnChanges {

  /** Shares Account Product Template */
  @Input() sharesAccountProductTemplate: any;
  /** Shares Account Template */
  @Input() sharesAccountTemplate: any;
  /** Currency Code */
  @Input() currencyCode: FormControl;

  /** Charge Data */
  chargeData: any;
  /** Charges Data Source */
  chargesDataSource: {}[];
  /** Display columns for charges table */
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'action'];

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.chargeData = this.sharesAccountTemplate.chargeOptions.map((charge: any) => {
      charge.chargeId = charge.id;
      delete charge.id;
      return charge;
    });
    this.currencyCode.valueChanges.subscribe(() => this.chargesDataSource = []);
  }

  ngOnChanges() {
    this.chargesDataSource = this.sharesAccountProductTemplate ? (this.sharesAccountProductTemplate.charges || []) : [];
  }

  /**
   * Adds the charge to charges table
   * @param {any} charge Charge
   */
  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
  }

  /**
   * Edits Charge Amount
   * @param {any} charge Charge
   */
  editCharge(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: charge.amount,
        type: 'text',
        required: true,
      }),
    ];
    const data = {
      title: 'Edit Charge',
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
  }

  /**
   * Removes the charge from charges table
   * @param {any} charge Charge
   */
  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
  }

  /**
   * Returns shares account charges
   */
  get sharesAccountCharges() {
    return { charges: this.chargesDataSource };
  }

}
