import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Dates } from 'app/core/utils/dates';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

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
  /** Currency Code */
  // @Input() currencyCode: FormControl;
  // /** active Client Members in case of GLIM Account */
  @Input() activeClientMembers?: any;

  /** Charge Data */
  chargeData: any = [];
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  /** For Edit Savings Account Form */
  isChargesPatched = false;
  /** Display columns for charges table */
  displayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'repaymentsEvery',
    'action'
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

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    public dialog: MatDialog,
    private dateUtils: Dates
  ) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
  }

  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.chargeData = this.loansAccountProductTemplate.chargeOptions;
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
        const dateFormat = 'dd MMMM yyyy';
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
    this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
    this.chargesDataSource = this.chargesDataSource.concat([]);
    this.pristine = false;
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

  /** Toggle all checks */
  toggleSelects() {
    for (const member of this.activeClientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  /** Check if all the checks are selected */
  toggleSelect() {
    const len = this.activeClientMembers.length;
    this.selectAllItems =
      len === 0 ? false : this.activeClientMembers.filter((item: any) => item.selected).length === len;
  }
}
