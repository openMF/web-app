/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';

/** Custom Services */
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Recurring Deposit Account Charges Step
 */
@Component({
  selector: 'mifosx-loans-account-charges-step',
  templateUrl: './loans-account-charges-step.component.html',
  styleUrls: ['./loans-account-charges-step.component.scss']
})
export class LoansAccountChargesStepComponent implements OnInit, OnChanges {

  // @Input loansAccountProductTemplate: LoansAccountProductTemplate
  @Input() loansAccountProductTemplate: any;
  // @Imput loansAccountTemplate: LoansAccountTemplate
  @Input() loansAccountTemplate: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;
  // @Input collateralOptions: Collateral Options
  @Input() collateralOptions: any;
  // @Input loanPrincipal: Loan Principle
  @Input() loanPrincipal: any;

  /** Charges Data */
  chargeData: any;
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Overdue Charges Data Source */
  overDueChargesDataSource: {}[] = [];
  /** Collateral Data Source */
  collateralDataSource: {}[] = [];
  /** Charges table columns */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date', 'action'];
  /** Columns to be displayed in overdue charges table. */
  overdueChargesDisplayedColumns: string[] = ['name', 'type', 'amount', 'collectedon'];
  /** Columns to be displayed in collateral table. */
  loanCollateralDisplayedColumns: string[] = ['type', 'value', 'totalValue', 'totalCollateralValue', 'action'];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  /** Check if value of collateral added  is more than principal amount */
  isCollateralSufficient = false;
  /** Total value of all collateral added to a loan */
  totalCollateralValue: any = 0;

  /**
   * Loans Account Charges Form Step
   * @param {dialog} MatDialog Mat Dialog
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(public dialog: MatDialog,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
  }

  ngOnInit() {
    if (this.loansAccountTemplate.charges) {
      this.chargesDataSource = this.loansAccountTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
    }
  }

  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.chargeData = this.loansAccountProductTemplate.chargeOptions;
      if (this.loansAccountProductTemplate.overdueCharges) {
        this.overDueChargesDataSource = this.loansAccountProductTemplate.overdueCharges;
      }
    }
  }

  /**
   * Add a charge
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
        const dateFormat = this.settingsService.dateFormat;
        const date = this.dateUtils.formatDate(response.data.value.date, dateFormat);
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
   * Delete a particular charge
   * @param charge Charge
   */
  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
        this.pristine = false;
      }
    });
  }

  /**
   * Add a Collateral to the loan
   */
  addCollateral() {
    const addCollateralDialogRef = this.dialog.open(LoansAccountAddCollateralDialogComponent, {
      data: { collateralOptions: this.collateralOptions }
    });
    console.log(this.collateralOptions);
    addCollateralDialogRef.afterClosed().subscribe((response: any) => {
      console.log(this.loanPrincipal);
      if (response.data) {
        const collateralData = {
          type: response.data.value.collateral,
          value: response.data.value.quantity,
        };

        this.totalCollateralValue += collateralData.type.pctToBase * collateralData.type.basePrice * collateralData.value / 100;
        this.collateralDataSource = this.collateralDataSource.concat(collateralData);
        this.collateralOptions = this.collateralOptions.filter((user: any) => user.collateralId !== response.data.value.collateral.collateralId);
        if (this.loanPrincipal < this.totalCollateralValue) {
          this.isCollateralSufficient = true;
        } else {
          this.isCollateralSufficient = false;
        }
      }
    });
  }
  /**
   * Delete a added collateral from loan
   * @param id ID od the collateral to be deleted
   */
  deleteCollateral(id: any) {
    const deleteCollateralDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `collateral` }
    });
    deleteCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const removed: any = this.collateralDataSource.splice(id, 1);
        this.collateralOptions = this.collateralOptions.concat(removed[0].type);
        this.totalCollateralValue -= removed[0].type.pctToBase * removed[0].type.basePrice * removed[0].value / 100;
        this.collateralDataSource = this.collateralDataSource.concat([]);
        this.pristine = false;
        if (this.loanPrincipal < this.totalCollateralValue) {
          this.isCollateralSufficient = true;
        } else {
          this.isCollateralSufficient = false;
        }
      }
    });
  }

  /**
   * Returns Loans Account Charges and Collateral Form
   */
  get loansAccountCharges() {
    return {
      charges: this.chargesDataSource,
      collateral: this.collateralDataSource
    };
  }

}
