/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';

import {
  RemittanceTransaction,
  PayoutAssignmentResponse,
  PayoutConfirmationResponse
} from '../../models/remittance.model';
import { ValidatedRecipient } from '../../models/beneficiary.model';
import { RemittanceStatus, isTerminalStatus } from '../../models/remittance-status.enum';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-payment-receipt-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon
  ],
  templateUrl: './payment-receipt-step.component.html',
  styleUrls: ['./payment-receipt-step.component.scss']
})
export class PaymentReceiptStepComponent {
  private authService = inject(AuthenticationService);
  private translateService = inject(TranslateService);

  @Input() remittanceData: RemittanceTransaction | null = null;
  @Input() recipientData: ValidatedRecipient | null = null;
  @Input() payoutConfirmation: PayoutConfirmationResponse | null = null;
  @Input() payoutAssignment: PayoutAssignmentResponse | null = null;
  @Input() parsedStatus: RemittanceStatus = RemittanceStatus.UNKNOWN;
  @Output() resetWorkflow = new EventEmitter<void>();

  get officeName(): string {
    return this.authService.getCredentials()?.officeName || '';
  }

  get isPaid(): boolean {
    return this.parsedStatus === RemittanceStatus.PAID;
  }

  get isTerminal(): boolean {
    return isTerminalStatus(this.parsedStatus) && !this.isPaid;
  }

  get receiptIcon(): string {
    if (this.isPaid) return 'check_circle';
    if (this.isTerminal) return 'cancel';
    return 'info';
  }

  get receiptTitle(): string {
    if (this.isPaid) return this.translateService.instant('labels.heading.Payment Successful');
    if (this.isTerminal)
      return this.translateService.instant('labels.heading.Transaction') + ' ' + (this.remittanceData?.status || '');
    return this.translateService.instant('labels.heading.Transaction Status');
  }

  onNewRemittance(): void {
    this.resetWorkflow.emit();
  }

  printReceipt(): void {
    window.print();
  }
}
