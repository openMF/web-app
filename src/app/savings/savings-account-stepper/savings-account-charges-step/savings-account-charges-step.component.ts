/** Angular Imports */
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { Dates } from 'app/core/utils/dates';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { ChargesFilterPipe } from '../../../pipes/charges-filter.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings Account Charges Step
 */
@Component({
  selector: 'mifosx-savings-account-charges-step',
  templateUrl: './savings-account-charges-step.component.html',
  styleUrls: ['./savings-account-charges-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    MatStepperNext,
    ChargesFilterPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class SavingsAccountChargesStepComponent implements OnInit, OnChanges {
  /** Savings Account Product Template */
  @Input() savingsAccountProductTemplate: any;
  /** Savings Account Template */
  @Input() savingsAccountTemplate: any;
  /** Currency Code */
  @Input() currencyCode: UntypedFormControl;
  /** active Client Members in case of GSIM Account */
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
    'name'
  ];

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private dialog: MatDialog,
    private dateUtils: Dates,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    if (this.savingsAccountTemplate) {
      if (!this.isChargesPatched && this.savingsAccountTemplate.charges) {
        this.chargesDataSource =
          this.savingsAccountProductTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
        this.isChargesPatched = true;
      } else {
        this.chargesDataSource = [];
      }
    }
  }

  ngOnChanges() {
    if (this.savingsAccountProductTemplate) {
      this.chargeData = this.savingsAccountProductTemplate.chargeOptions;
      this.chargesDataSource =
        this.savingsAccountProductTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
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
        label: this.translateService.instant('labels.inputs.Amount'),
        value: charge.amount,
        type: 'number',
        required: false
      })

    ];
    const data = {
      title: this.translateService.instant('labels.heading.Edit Charge Amount'),
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
        label: this.translateService.instant('labels.inputs.Date'),
        value: charge.dueDate || charge.feeOnMonthDay || '',
        type: 'datetime-local',
        required: false
      })

    ];
    const data = {
      title: this.translateService.instant('labels.heading.Edit Charge Date'),
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
          case 'Monthly Fee':
            const dateMonthDay = this.dateUtils.formatDate(response.data.value.date, 'dd MMMM');
            newCharge = { ...charge, feeOnMonthDay: dateMonthDay };
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
   * Returns savings account charges
   */
  get savingsAccountCharges() {
    return { charges: this.chargesDataSource };
  }
}
