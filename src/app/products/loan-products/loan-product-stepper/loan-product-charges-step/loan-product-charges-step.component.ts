/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatIconButton } from '@angular/material/button';
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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from '../../common/loan-product-base.component';
import { LoanProducts } from '../../loan-products';
import { isDownPaymentCharge } from 'app/products/charges/models/charge.model';

@Component({
  selector: 'mifosx-loan-product-charges-step',
  templateUrl: './loan-product-charges-step.component.html',
  styleUrls: ['./loan-product-charges-step.component.scss'],
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
    MatDivider,
    MatStepperPrevious,
    MatStepperNext,
    ChargesFilterPipe,
    ChargesPenaltyFilterPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductChargesStepComponent extends LoanProductBaseComponent implements OnInit, OnChanges {
  dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private settingsFormSubscription?: Subscription;

  @ViewChild('charge') chargeSelect?: MatSelect;

  @Input() loanProductsTemplate: any;
  @Input() currencyCode: UntypedFormControl;
  @Input() multiDisburseLoan: UntypedFormControl | null;
  /** Form holding `enableDownPayment` and `loanScheduleType`; down payment fees are offered only when they allow it. */
  @Input() loanProductSettingsForm: AbstractControl | null = null;

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

  constructor() {
    super();
  }

  pristine = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loanProductSettingsForm']) {
      this.settingsFormSubscription?.unsubscribe();
      this.settingsFormSubscription = this.loanProductSettingsForm?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.removeUnsupportedDownPaymentCharges());
    }
  }

  ngOnInit() {
    this.chargeData = this.loanProductsTemplate.chargeOptions;
    this.overdueChargeData = this.loanProductsTemplate.penaltyOptions
      ? this.loanProductsTemplate.penaltyOptions.filter(
          (penalty: any) => penalty.chargeTimeType.code === 'chargeTimeType.overdueInstallment'
        )
      : [];

    this.chargesDataSource = this.loanProductsTemplate.charges || [];
    this.pristine = true;

    this.currencyCode.valueChanges.subscribe(() => this.clearCharges());
    if (this.loanProductService.isLoanProduct && this.multiDisburseLoan) {
      this.multiDisburseLoan.valueChanges.subscribe(() => this.clearCharges());
    }
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
        this.cdr.markForCheck();
      }
    });
  }

  private clearCharges() {
    this.chargesDataSource = [];
    this.cdr.markForCheck();
  }

  private removeUnsupportedDownPaymentCharges() {
    if (this.downPaymentChargesAllowed) {
      return;
    }
    if (isDownPaymentCharge(this.chargeSelect?.value)) {
      this.chargeSelect.value = '';
      this.cdr.markForCheck();
    }
    if (this.chargesDataSource?.some((charge) => isDownPaymentCharge(charge))) {
      this.chargesDataSource = this.chargesDataSource.filter((charge) => !isDownPaymentCharge(charge));
      this.pristine = false;
      this.cdr.markForCheck();
    }
  }

  get downPaymentChargesAllowed(): boolean {
    return (
      !this.loanProductSettingsForm ||
      LoanProducts.supportsDownPaymentCharges(
        this.loanProductSettingsForm.get('enableDownPayment')?.value,
        this.loanProductSettingsForm.get('loanScheduleType')?.value
      )
    );
  }

  get loanProductCharges() {
    return {
      charges: this.chargesDataSource
    };
  }
}
