/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanOriginator } from 'app/loans/models/loan-account.model';

/**
 * View Employee Component.
 */
@Component({
  selector: 'mifosx-view-loan-originator',
  templateUrl: './view-loan-originator.component.html',
  styleUrl: './view-loan-originator.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewLoanOriginatorComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  /** Employee data. */
  loanOriginatorData: LoanOriginator;

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanOriginatorData: LoanOriginator }) => {
        this.loanOriginatorData = data.loanOriginatorData;
      });
  }
}
