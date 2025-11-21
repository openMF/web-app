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
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-charges-step',
  templateUrl: './share-product-charges-step.component.html',
  styleUrls: ['./share-product-charges-step.component.scss'],
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
    FormatNumberPipe
  ]
})
export class ShareProductChargesStepComponent implements OnInit, OnDestroy {
  @Input() shareProductsTemplate: any;
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

  pristine = true;
  /** Subject to handle subscription cleanup */
  private destroy$ = new Subject<void>();

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.chargeData = this.shareProductsTemplate.chargeOptions;

    this.chargesDataSource = this.shareProductsTemplate.charges || [];
    this.pristine = true;

    this.currencyCode.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => (this.chargesDataSource = []));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  get shareProductCharges() {
    return {
      chargesSelected: this.chargesDataSource
    };
  }
}
