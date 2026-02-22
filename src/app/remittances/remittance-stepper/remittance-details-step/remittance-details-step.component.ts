/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatIcon } from '@angular/material/icon';

import { RemittanceTransaction } from '../../models/remittance.model';
import { RemittanceStatus, isTerminalStatus } from '../../models/remittance-status.enum';

@Component({
  selector: 'mifosx-remittance-details-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon
  ],
  templateUrl: './remittance-details-step.component.html',
  styleUrls: ['./remittance-details-step.component.scss']
})
export class RemittanceDetailsStepComponent {
  @Input() remittanceData: RemittanceTransaction | null = null;
  @Input() parsedStatus: RemittanceStatus = RemittanceStatus.UNKNOWN;
  @Output() detailsNext = new EventEmitter<void>();

  get isTerminal(): boolean {
    return isTerminalStatus(this.parsedStatus);
  }

  get isPaid(): boolean {
    return this.parsedStatus === RemittanceStatus.PAID;
  }

  get statusBadgeClass(): string {
    switch (this.parsedStatus) {
      case RemittanceStatus.PENDING:
        return 'badge-pending';
      case RemittanceStatus.READY_FOR_PAYOUT:
        return 'badge-ready';
      case RemittanceStatus.PAID:
        return 'badge-paid';
      case RemittanceStatus.REJECTED:
      case RemittanceStatus.CANCELED:
      case RemittanceStatus.EXPIRED:
        return 'badge-terminal';
      default:
        return 'badge-unknown';
    }
  }

  isValidDate(value: string | undefined): boolean {
    if (!value) return false;
    const timestamp = Date.parse(value);
    return !isNaN(timestamp);
  }

  onNext(): void {
    this.detailsNext.emit();
  }
}
