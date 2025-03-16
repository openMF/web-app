/** Angular Imports */
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ActivatedRoute } from '@angular/router';

/**
 * GLIM Account Charges Step
 */
@Component({
  selector: 'mifosx-glim-charges-step',
  templateUrl: './glim-charges-step.component.html',
  styleUrls: ['./glim-charges-step.component.scss']
})
export class GlimChargesStepComponent implements OnInit, OnChanges {
  /** Savings Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Savings Account Template */
  @Input() loansAccountTemplate: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;
  // active Client Members in case of GLIM Account
  @Input() activeClientMembers?: any;

  /** Charge Data */
  chargeData: any = [];
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Overdue Charges Data Source */
  overDueChargesDataSource: {}[] = [];
  /** Display columns for charges table */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'action'
  ];
  /** Columns to be displayed in overdue charges table. */
  overdueChargesDisplayedColumns: string[] = [
    'name',
    'type',
    'amount',
    'collectedon'
  ];

  /** Table Data Source */
  dataSource: any;
  /** Check for select all the Clients List */
  selectAllItems = false;
  /** Loan Purpose Options */
  loanPurposeOptions: string[] = [];
  /** Table Displayed Columns */
  displayedColumn: string[] = [
    'check',
    'id',
    'name',
    'purpose',
    'amount'
  ];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  loanId: any = null;

  /**
   * GLIM Account Charges Form Step
   * @param {dialog} MatDialog Mat Dialog
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    public dialog: MatDialog,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    // TODO: This might still need adjustments due to GLIM
    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);

    // Loan Account code:
    if (this.loansAccountTemplate.charges) {
      this.chargesDataSource =
        this.loansAccountTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
    }
  }

  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.loanPurposeOptions = this.loansAccountProductTemplate.loanPurposeOptions;

      this.chargeData = this.loansAccountProductTemplate.chargeOptions;
      if (this.loansAccountProductTemplate.overdueCharges) {
        this.overDueChargesDataSource = this.loansAccountProductTemplate.overdueCharges;
      }
      if (
        this.loansAccountProductTemplate.charges &&
        this.loansAccountProductTemplate.charges.length > 0 &&
        this.chargesDataSource.length === 0
      ) {
        this.chargesDataSource =
          this.loansAccountProductTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
      }
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
      })

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
      })

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
      })

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
   * Returns loan account charges
   */
  get loansAccountCharges() {
    return { charges: this.chargesDataSource };
  }

  get selectedClientMembers() {
    return { selectedMembers: this.activeClientMembers.filter((item: any) => item.selected) };
  }

  get isValid() {
    const sum = this.activeClientMembers
      ?.filter((item: any) => item.selected)
      .reduce((acc: number, member: any) => acc + member.principal, 0);
    return sum > 0;
  }

  toggleSelects() {
    for (const member of this.activeClientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  toggleSelect() {
    const len = this.activeClientMembers.length;
    this.selectAllItems =
      len === 0 ? false : this.activeClientMembers.filter((item: any) => item.selected).length === len;
  }
}
