/** Angular Imports */
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { TranslateService } from '@ngx-translate/core';
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
import { ChargesFilterPipe } from '../../../pipes/charges-filter.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Shares Account Charges Step
 */
@Component({
  selector: 'mifosx-shares-account-charges-step',
  templateUrl: './shares-account-charges-step.component.html',
  styleUrls: ['./shares-account-charges-step.component.scss'],
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
    ChargesFilterPipe
  ]
})
export class SharesAccountChargesStepComponent implements OnInit, OnChanges {
  /** Shares Account Product Template */
  @Input() sharesAccountProductTemplate: any;
  /** Shares Account Template */
  @Input() sharesAccountTemplate: any;
  /** Currency Code */
  @Input() currencyCode: UntypedFormControl;

  /** Charge Data */
  chargeData: any = [];
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  /** For Edit Shares Account Form */
  isChargesPatched = false;
  /** Display columns for charges table */
  displayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'action'
  ];

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.currencyCode.valueChanges.subscribe(() => {
      if (!this.isChargesPatched && this.sharesAccountTemplate.charges) {
        this.chargesDataSource = this.sharesAccountTemplate.charges;
        this.isChargesPatched = true;
      } else {
        this.chargesDataSource = [];
      }
    });
  }

  ngOnChanges() {
    if (this.sharesAccountProductTemplate) {
      this.chargeData = this.sharesAccountTemplate.chargeOptions;
      this.chargesDataSource = this.sharesAccountProductTemplate.charges;
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
   * Edits Charge Amount
   * @param {any} charge Charge
   */
  editCharge(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: this.translateService.instant('labels.inputs.Amount'),
        value: charge.amount || charge.amountOrPercentage,
        type: 'number',
        required: false
      })

    ];
    const data = {
      title: this.translateService.instant('labels.heading.Edit Charge'),
      layout: { addButtonText: 'Submit' },
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
    this.pristine = false;
  }

  /**
   * Returns shares account charges
   */
  get sharesAccountCharges() {
    return { charges: this.chargesDataSource };
  }
}
