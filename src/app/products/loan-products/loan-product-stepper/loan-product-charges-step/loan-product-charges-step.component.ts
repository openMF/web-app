import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
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
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { ChargesFilterPipe } from '../../../../pipes/charges-filter.pipe';
import { ChargesPenaltyFilterPipe } from '../../../../pipes/charges-penalty-filter.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';

@Component({
  selector: 'mifosx-loan-product-charges-step',
  templateUrl: './loan-product-charges-step.component.html',
  styleUrls: ['./loan-product-charges-step.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatButton,
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
    MatDivider,
    MatStepperPrevious,
    MatStepperNext,
    TranslatePipe,
    ChargesFilterPipe,
    ChargesPenaltyFilterPipe,
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class LoanProductChargesStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() currencyCode: UntypedFormControl;
  @Input() multiDisburseLoan: UntypedFormControl;

  chargeData: any;
  overdueChargeData: any;

  chargesDataSource: {}[];
  displayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'action'
  ];

  pristine = true;

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.chargeData = this.loanProductsTemplate.chargeOptions;
    this.overdueChargeData = this.loanProductsTemplate.penaltyOptions
      ? this.loanProductsTemplate.penaltyOptions.filter(
          (penalty: any) => penalty.chargeTimeType.code === 'chargeTimeType.overdueInstallment'
        )
      : [];

    this.chargesDataSource = this.loanProductsTemplate.charges || [];
    this.pristine = true;

    this.currencyCode.valueChanges.subscribe(() => (this.chargesDataSource = []));
    this.multiDisburseLoan.valueChanges.subscribe(() => (this.chargesDataSource = []));
  }

  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
    this.pristine = false;
  }

  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.Charge') + ' ' + charge.name }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
        this.pristine = false;
      }
    });
  }

  get loanProductCharges() {
    return {
      charges: this.chargesDataSource
    };
  }
}
