/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { MatStepper, MatStep, MatStepLabel } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from '../../standalone-shared.module';

import {
  RemittanceTransaction,
  PayoutAssignmentResponse,
  PayoutConfirmationResponse,
  RemittanceVendor
} from '../models/remittance.model';
import { ValidatedRecipient } from '../models/beneficiary.model';
import { RemittanceStatus, parseRemittanceStatus, isTerminalStatus } from '../models/remittance-status.enum';

import { SearchRemittanceStepComponent } from '../remittance-stepper/search-remittance-step/search-remittance-step.component';
import { RemittanceDetailsStepComponent } from '../remittance-stepper/remittance-details-step/remittance-details-step.component';
import { SearchBeneficiaryStepComponent } from '../remittance-stepper/search-beneficiary-step/search-beneficiary-step.component';
import { BeneficiaryDetailsStepComponent } from '../remittance-stepper/beneficiary-details-step/beneficiary-details-step.component';
import { TransactionalProfileStepComponent } from '../remittance-stepper/transactional-profile-step/transactional-profile-step.component';
import { ConfirmPaymentStepComponent } from '../remittance-stepper/confirm-payment-step/confirm-payment-step.component';
import { PaymentReceiptStepComponent } from '../remittance-stepper/payment-receipt-step/payment-receipt-step.component';

@Component({
  selector: 'mifosx-process-remittance',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStep,
    MatStepLabel,
    SearchRemittanceStepComponent,
    RemittanceDetailsStepComponent,
    SearchBeneficiaryStepComponent,
    BeneficiaryDetailsStepComponent,
    TransactionalProfileStepComponent,
    ConfirmPaymentStepComponent,
    PaymentReceiptStepComponent
  ],
  templateUrl: './process-remittance.component.html',
  styleUrls: ['./process-remittance.component.scss']
})
export class ProcessRemittanceComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  private cdr = inject(ChangeDetectorRef);

  /** Shared state across steps */
  remittanceData: RemittanceTransaction | null = null;
  recipientData: ValidatedRecipient | null = null;
  payoutAssignment: PayoutAssignmentResponse | null = null;
  payoutConfirmation: PayoutConfirmationResponse | null = null;
  selectedVendor: RemittanceVendor | null = null;
  transactionId = '';
  parsedStatus: RemittanceStatus = RemittanceStatus.UNKNOWN;
  selectedClientId: number | null = null;

  /** Step completion flags */
  detailsReviewed = false;
  beneficiaryReviewed = false;

  /** Step visibility control - explicit properties for better change detection */
  showBeneficiarySteps = false;
  showConfirmStep = false;

  private updateStepVisibility(): void {
    // Beneficiary steps (3-5) only show for PENDING.
    // Per spec: READY_FOR_PAYOUT skips directly to Confirm Payment.
    // IMPORTANT: Once shown, never hide — prevents mid-flow step destruction
    // when assignPayout changes status from PENDING → READY_FOR_PAYOUT.
    this.showBeneficiarySteps = this.showBeneficiarySteps || this.parsedStatus === RemittanceStatus.PENDING;

    // Confirm step only shows for READY_FOR_PAYOUT (the only actionable confirm state).
    // Terminal statuses (PAID, REJECTED, etc.) skip directly to Payment Receipt.
    this.showConfirmStep = this.showConfirmStep || this.parsedStatus === RemittanceStatus.READY_FOR_PAYOUT;
  }

  /**
   * Called when Step 1 (Search) finds a remittance.
   */
  onRemittanceFound(event: {
    transaction: RemittanceTransaction;
    transactionId: string;
    vendor: RemittanceVendor;
  }): void {
    this.remittanceData = event.transaction;
    this.transactionId = event.transactionId;
    this.selectedVendor = event.vendor;
    this.parsedStatus = parseRemittanceStatus(event.transaction.status);

    // Update step visibility based on new status
    this.updateStepVisibility();
    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
      this.stepper.next();
    });
  }

  /**
   * Called after Step 2 (Remittance Details) user clicks Next.
   * Routes based on status.
   */
  onDetailsNext(): void {
    this.detailsReviewed = true;
    this.cdr.detectChanges();

    if (isTerminalStatus(this.parsedStatus)) {
      this.goToLastStep();
    } else {
      this.stepper.next();
    }
  }

  /**
   * Called when Step 3 (Search Beneficiary) validates a recipient.
   */
  onRecipientValidated(recipient: ValidatedRecipient): void {
    this.recipientData = recipient;
    this.cdr.detectChanges();
    this.stepper.next();
  }

  /**
   * Called after Step 4 (Beneficiary Details) user selects client and clicks Next.
   */
  onBeneficiaryDetailsNext(clientId: number): void {
    this.selectedClientId = clientId;
    this.beneficiaryReviewed = true;
    this.cdr.detectChanges();
    this.stepper.next();
  }

  /**
   * Called when Step 5 (Transactional Profile) assigns payout.
   * Status typically changes from PENDING → READY_FOR_PAYOUT here.
   */
  onPayoutAssigned(assignment: PayoutAssignmentResponse): void {
    this.payoutAssignment = assignment;
    this.parsedStatus = parseRemittanceStatus(assignment.status);

    // Update step visibility — showConfirmStep will become true
    // showBeneficiarySteps stays true (never contracts once expanded)
    this.updateStepVisibility();

    this.cdr.detectChanges();

    // Navigate to confirm step (next visible step after transactional profile)
    if (isTerminalStatus(this.parsedStatus)) {
      this.goToLastStep();
    } else {
      this.goToConfirmStep();
    }
  }

  /**
   * Called when Step 6 (Confirm Payment) confirms payout.
   */
  onPayoutConfirmed(confirmation: PayoutConfirmationResponse): void {
    this.payoutConfirmation = confirmation;
    this.parsedStatus = RemittanceStatus.PAID;
    this.cdr.detectChanges();
    this.stepper.next();
  }

  /**
   * Reset the entire workflow.
   */
  resetWorkflow(): void {
    this.remittanceData = null;
    this.recipientData = null;
    this.payoutAssignment = null;
    this.payoutConfirmation = null;
    this.selectedVendor = null;
    this.transactionId = '';
    this.parsedStatus = RemittanceStatus.UNKNOWN;
    this.selectedClientId = null;
    this.detailsReviewed = false;
    this.beneficiaryReviewed = false;

    // Reset step visibility
    this.showBeneficiarySteps = false;
    this.showConfirmStep = false;

    this.stepper.reset();
  }

  private goToConfirmStep(): void {
    // Use setTimeout to ensure the DOM is updated after status change
    setTimeout(() => {
      const steps = this.stepper.steps.toArray();

      // Confirm step is always second to last (before Receipt)
      const confirmIndex = steps.length - 2;

      if (confirmIndex >= 0 && confirmIndex < steps.length) {
        this.stepper.selectedIndex = confirmIndex;
      } else {
        this.goToLastStep();
      }
    }, 0);
  }

  private goToLastStep(): void {
    // Use setTimeout to ensure the DOM is updated
    setTimeout(() => {
      this.stepper.selectedIndex = this.stepper.steps.length - 1;
    }, 0);
  }
}
