/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { catchError, finalize } from 'rxjs';

/** Custom Services */
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { TransferFeesService } from '../transfer-fees.service';
import { TranslateService } from '@ngx-translate/core';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { YesnoPipe } from '@pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  TRANSFER_FEE_TRANSFER_MODES,
  TRANSFER_FEE_TRANSFER_TYPES,
  TRANSFER_FEE_TYPES,
  TransferFee,
  TransferFeeOption
} from '../models/transfer-fee.model';

interface DeleteDialogResult {
  delete?: boolean;
}

/**
 * View transfer fee component.
 */
@Component({
  selector: 'mifosx-view-transfer-fee',
  templateUrl: './view-transfer-fee.component.html',
  styleUrls: ['./view-transfer-fee.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    FormatNumberPipe,
    YesnoPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTransferFeeComponent {
  private transferFeesService = inject(TransferFeesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService);
  private translateService = inject(TranslateService);

  /** Transfer fee data. */
  transferFeeData: TransferFee | null = null;
  /** Loading state for delete action. */
  isDeleting = false;

  /**
   * Retrieves the transfer fee data from `resolve`.
   */
  constructor() {
    this.route.data.subscribe((data: { transferFee: TransferFee }) => {
      this.transferFeeData = data.transferFee;
    });
  }

  /**
   * Deletes the transfer fee and redirects to transfer fees.
   */
  deleteTransferFee(): void {
    if (!this.transferFeeData?.id || this.isDeleting) {
      return;
    }

    const deleteTransferFeeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `${this.transferFeeData.id}` }
    });
    deleteTransferFeeDialogRef.afterClosed().subscribe((response: DeleteDialogResult | undefined) => {
      if (response?.delete) {
        this.isDeleting = true;
        this.transferFeesService
          .deleteTransferFee(this.transferFeeData.id)
          .pipe(
            catchError((error) =>
              this.errorHandler.handleError(error, this.translateService.instant('labels.text.Transfer Fee Deletion'))
            ),
            finalize(() => {
              this.isDeleting = false;
            })
          )
          .subscribe(() => {
            this.errorHandler.showSuccess(
              this.translateService.instant('labels.text.Transfer fee deleted successfully')
            );
            this.router.navigate(['/products/transfer-fees']);
          });
      }
    });
  }

  /**
   * @param {string} value Option value.
   * @param {TransferFeeOption[]} options Options list.
   * @returns {string} Option label key.
   */
  optionLabelKey(value: string | null | undefined, options: TransferFeeOption[]): string {
    return options.find((option: TransferFeeOption) => option.value === value)?.labelKey || value || '-';
  }

  transferTypeLabelKey(value: string): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TRANSFER_TYPES);
  }

  transferModeLabelKey(value: string | null | undefined): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TRANSFER_MODES);
  }

  feeTypeLabelKey(value: string): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TYPES);
  }
}
