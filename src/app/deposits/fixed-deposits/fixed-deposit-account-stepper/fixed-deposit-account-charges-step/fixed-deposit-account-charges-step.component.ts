/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { Dates } from 'app/core/utils/dates';
import { Charge, Currency } from 'app/shared/models/general.model';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
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
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed Deposit Account Charges Step
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-charges-step',
  templateUrl: './fixed-deposit-account-charges-step.component.html',
  styleUrls: ['./fixed-deposit-account-charges-step.component.scss'],
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
    DateFormatPipe
  ]
})
export class FixedDepositAccountChargesStepComponent implements OnInit, OnChanges {
  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate: any;
  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate: any;
  /** Validity of fixed depsits account form */
  @Input() fixedDepositAccountFormValid: boolean;
  /** Currency Code */
  currency: Currency | null = null;

  /** Charges Data */
  chargeData: any;
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Charges table columns */
  displayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'repaymentsEvery',
    'action'
  ];
  /** For Edit Fixed Deposits Account Form */
  isChargesPatched = false;
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;

  /**
   * @param {MatDialog} dialog Mat Dialog
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    public dialog: MatDialog,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.chargesDataSource = [];
    if (this.fixedDepositsAccountTemplate.id && this.fixedDepositsAccountTemplate.charges) {
      this.chargesDataSource =
        this.fixedDepositsAccountTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
    }
  }

  ngOnChanges() {
    if (this.currency == null) {
      if (this.fixedDepositsAccountTemplate.currency) {
        this.currency = this.fixedDepositsAccountTemplate.currency;
      } else if (this.fixedDepositsAccountProductTemplate && this.fixedDepositsAccountProductTemplate.currency) {
        this.currency = this.fixedDepositsAccountProductTemplate.currency;
      }
    }
    if (this.fixedDepositsAccountProductTemplate) {
      this.chargeData = this.fixedDepositsAccountProductTemplate.chargeOptions.filter(
        (c: Charge) => c.currency.code === this.currency.code
      );
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
      })

    ];
    const data = {
      title: 'Edit Charge Amount',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editChargeAmountDialogRef = this.dialog.open(FormDialogComponent, { data });
    editChargeAmountDialogRef.afterClosed().subscribe((response: any) => {
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
    const editChargeDateDialogRef = this.dialog.open(FormDialogComponent, { data });
    editChargeDateDialogRef.afterClosed().subscribe((response: any) => {
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
    const editChargeFeeIntervalDialogRef = this.dialog.open(FormDialogComponent, { data });
    editChargeFeeIntervalDialogRef.afterClosed().subscribe((response: any) => {
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
    this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
    this.chargesDataSource = this.chargesDataSource.concat([]);
    this.pristine = false;
  }

  /**
   * Returns Fixed Deposits Account Charges Form
   */
  get fixedDepositAccountCharges() {
    return { charges: this.chargesDataSource };
  }
}
