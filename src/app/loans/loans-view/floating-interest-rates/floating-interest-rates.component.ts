/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-floating-interest-rates',
  templateUrl: './floating-interest-rates.component.html',
  styleUrls: ['./floating-interest-rates.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingInterestRatesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  /** Loan Details */
  loanDetails: any;
  /** Interest Rate Data */
  interestRateData: any;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = [
    'fromDate',
    'interestRate'
  ];

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }

  ngOnInit() {
    this.interestRateData = this.loanDetails.interestRatesPeriods;
  }
}
