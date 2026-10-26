/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

/** Custom Models */
import {
  WorkingCapitalBalances,
  WorkingCapitalWriteOffBalance,
  mapWorkingCapitalWriteOffBalance
} from 'app/loans/models/working-capital/working-capital-loan-account.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Recovery panel of a written-off Working Capital loan.
 *
 * Shows how much of the written-off loss has been recovered and, above all, how
 * much is still recoverable: the outstanding balance stays at zero after a
 * write-off, so this is the only place where the remaining exposure is visible.
 */
@Component({
  selector: 'mifosx-working-capital-recovery-panel',
  templateUrl: './loan-recovery-panel.component.html',
  styleUrl: './loan-recovery-panel.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalRecoveryPanelComponent {
  /** Loan currency code used to format the amounts. */
  @Input() currencyCode: string | null = null;

  /** Derived write-off and recovery figures. */
  writeOffBalance: WorkingCapitalWriteOffBalance | null = null;

  /** Raw `balance` block of the loan; mapped once on assignment. */
  @Input()
  set balance(balance: WorkingCapitalBalances | null | undefined) {
    this.writeOffBalance = mapWorkingCapitalWriteOffBalance(balance);
  }
}
