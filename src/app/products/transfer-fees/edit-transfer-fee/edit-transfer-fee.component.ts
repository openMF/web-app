/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckbox } from '@angular/material/checkbox';

/** rxjs Imports */
import { catchError, finalize } from 'rxjs';

/** Custom Services */
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { OrganizationService } from 'app/organization/organization.service';
import { TransferFeesService } from '../transfer-fees.service';
import { TranslateService } from '@ngx-translate/core';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  TRANSFER_FEE_TRANSFER_MODES,
  TRANSFER_FEE_TRANSFER_TYPES,
  TRANSFER_FEE_TYPES,
  CurrencyOption,
  TransferFee,
  TransferFeeOption,
  TransferFeePayload
} from '../models/transfer-fee.model';
import { buildTransferFeePayload, createTransferFeeForm } from '../transfer-fee-form';

/**
 * Edit transfer fee component.
 */
@Component({
  selector: 'mifosx-edit-transfer-fee',
  templateUrl: './edit-transfer-fee.component.html',
  styleUrls: ['./edit-transfer-fee.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTransferFeeComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private organizationService = inject(OrganizationService);
  private transferFeesService = inject(TransferFeesService);
  private errorHandler = inject(ErrorHandlerService);
  private translateService = inject(TranslateService);

  /** Transfer fee data. */
  transferFeeData: TransferFee | null = null;
  /** Transfer fee form. */
  transferFeeForm: UntypedFormGroup;
  /** Loading state for submit action. */
  isSubmitting = false;

  transferTypeOptions: TransferFeeOption[] = TRANSFER_FEE_TRANSFER_TYPES;
  currencyOptions: CurrencyOption[] = [];
  transferModeOptions: TransferFeeOption[] = TRANSFER_FEE_TRANSFER_MODES;
  feeTypeOptions: TransferFeeOption[] = TRANSFER_FEE_TYPES;

  /**
   * Retrieves the transfer fee data from `resolve`.
   */
  ngOnInit(): void {
    this.route.data.subscribe((data: { transferFee: TransferFee }) => {
      this.transferFeeData = data.transferFee;
      this.createTransferFeeForm();
      this.loadCurrencyOptions();
    });
  }

  /**
   * Creates the transfer fee form.
   */
  createTransferFeeForm(): void {
    this.transferFeeForm = createTransferFeeForm(this.formBuilder, this.transferFeeData);
  }

  /**
   * Submits the edit transfer fee form.
   */
  submit(): void {
    if (this.transferFeeForm.invalid || this.isSubmitting || !this.transferFeeData?.id) {
      this.transferFeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.transferFeesService
      .updateTransferFee(this.transferFeeData.id, this.buildPayload())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleError(error, this.translateService.instant('labels.text.Transfer Fee Update'))
        ),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess(this.translateService.instant('labels.text.Transfer fee updated successfully'));
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  buildPayload(): TransferFeePayload {
    return buildTransferFeePayload(this.transferFeeForm);
  }

  private loadCurrencyOptions(): void {
    this.organizationService.getCurrencies().subscribe((currenciesData: any) => {
      this.currencyOptions = currenciesData?.selectedCurrencyOptions || [];
      this.changeDetectorRef.markForCheck();
    });
  }
}
