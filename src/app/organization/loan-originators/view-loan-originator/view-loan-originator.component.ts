/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
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
  ]
})
export class ViewLoanOriginatorComponent {
  private route = inject(ActivatedRoute);

  /** Employee data. */
  loanOriginatorData: LoanOriginator;

  /**
   * Retrieves the Loan Originator data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { loanOriginatorData: LoanOriginator }) => {
      this.loanOriginatorData = data.loanOriginatorData;
    });
  }
}
