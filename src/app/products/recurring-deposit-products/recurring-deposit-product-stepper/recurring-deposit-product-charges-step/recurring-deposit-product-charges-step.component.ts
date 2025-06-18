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
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { ChargesFilterPipe } from '../../../../pipes/charges-filter.pipe';

@Component({
  selector: 'mifosx-recurring-deposit-product-charges-step',
  templateUrl: './recurring-deposit-product-charges-step.component.html',
  styleUrls: ['./recurring-deposit-product-charges-step.component.scss'],
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
    MatStepperPrevious,
    MatStepperNext,
    TranslatePipe,
    ChargesFilterPipe,
    NgxTranslatePipe
  ]
})
export class RecurringDepositProductChargesStepComponent implements OnInit {
  @Input() recurringDepositProductsTemplate: any;
  @Input() currencyCode: UntypedFormControl;

  chargeData: any;

  chargesDataSource: {}[];
  displayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'action'
  ];

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.chargeData = this.recurringDepositProductsTemplate.chargeOptions;
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.chargesDataSource = this.recurringDepositProductsTemplate.charges;
    } else {
      this.chargesDataSource = [];
    }
    this.currencyCode.valueChanges.subscribe(() => (this.chargesDataSource = []));
  }

  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
  }

  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.Charge') + ' ' + charge.name }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
  }

  get recurringDepositProductCharges() {
    return {
      charges: this.chargesDataSource
    };
  }
}
