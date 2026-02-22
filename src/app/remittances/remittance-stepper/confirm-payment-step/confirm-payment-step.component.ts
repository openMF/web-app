/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { TranslateService } from '@ngx-translate/core';

import { RemittancesService } from '../../remittances.service';
import {
  RemittanceTransaction,
  RemittanceVendor,
  PayoutAssignmentResponse,
  PayoutConfirmationResponse
} from '../../models/remittance.model';
import { ValidatedRecipient } from '../../models/beneficiary.model';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

@Component({
  selector: 'mifosx-confirm-payment-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinner,
    MatIcon,
    MatDivider
  ],
  templateUrl: './confirm-payment-step.component.html',
  styleUrls: ['./confirm-payment-step.component.scss']
})
export class ConfirmPaymentStepComponent {
  @Input() vendor: RemittanceVendor | null = null;
  @Input() transactionId = '';
  @Input() remittanceData: RemittanceTransaction | null = null;
  @Input() recipientData: ValidatedRecipient | null = null;
  @Input() payoutAssignment: PayoutAssignmentResponse | null = null;
  @Input() clientId: number | null = null;
  @Output() payoutConfirmed = new EventEmitter<PayoutConfirmationResponse>();

  private remittancesService = inject(RemittancesService);
  private authService = inject(AuthenticationService);
  private translateService = inject(TranslateService);

  isLoading = false;
  errorMessage = '';

  get officeName(): string {
    return this.authService.getCredentials()?.officeName || '';
  }

  confirmPayout(): void {
    if (!this.vendor || !this.recipientData || !this.clientId) {
      this.errorMessage = this.translateService.instant('labels.text.Missing required information. Please try again.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.remittancesService
      .confirmPayout(this.vendor.headerValue, this.transactionId, this.clientId, {
        additionalInfo: {
          comment: 'Payout confirmation from web-app'
        }
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.payoutConfirmed.emit(response);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message ||
            this.translateService.instant(
              'labels.text.Failed to confirm payment. Please try again or contact support.'
            );
        }
      });
  }
}
