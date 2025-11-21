import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** RxJS Imports */
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-product-charges-step',
  templateUrl: './recurring-deposit-product-charges-step.component.html',
  styleUrls: ['./recurring-deposit-product-charges-step.component.scss'],
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
export class RecurringDepositProductChargesStepComponent implements OnInit, OnDestroy {
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
  /** Subject to handle subscription cleanup */
  private destroy$ = new Subject<void>();

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
    this.currencyCode.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => (this.chargesDataSource = []));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
