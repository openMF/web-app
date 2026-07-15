/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { BreachDisplayComponent } from 'app/shared/loan/breach-display/breach-display.component';
import { WorkingCapitalNearBreachActions } from 'app/loans/models/working-capital/working-capital-loan-account.model';

interface TimelineStep {
  label: string;
  date: unknown;
  by?: string;
  state: 'done' | 'pending' | 'rejected';
}

@Component({
  selector: 'mifosx-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    DateFormatPipe,
    FormatNumberPipe,
    BreachDisplayComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent extends LoanProductBaseComponent {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  loanNearBreachActions: WorkingCapitalNearBreachActions[] = [];
  loanDetails: any;
  timelineSteps: TimelineStep[] = [];

  constructor() {
    super();
    this.loanProductService.initialize(LoanProductBaseComponent.resolveProductTypeDefault(this.route, 'loan'));
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
      this.timelineSteps = this.buildTimelineSteps();
    });
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loanNearBreachActions: WorkingCapitalNearBreachActions[] }) => {
        this.loanNearBreachActions = data.loanNearBreachActions || [];
      });
  }

  camalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  has(value: unknown): boolean {
    return value !== null && value !== undefined;
  }

  hasDiscountSection(): boolean {
    return (
      this.has(this.loanDetails.proposedDiscountFee) ||
      this.has(this.loanDetails.approvedDiscountFee) ||
      this.has(this.loanDetails.discountFee)
    );
  }

  hasWcDelinquencyFacts(): boolean {
    return (
      this.has(this.loanDetails.breachGraceDays) ||
      this.has(this.loanDetails.delinquencyGraceDays) ||
      !!this.loanDetails.delinquencyStartType ||
      !!this.loanDetails.breach ||
      !!this.loanDetails.nearBreach
    );
  }

  hasAvailableDisbursementAmount(): boolean {
    return this.has(this.loanDetails?.delinquent?.availableDisbursementAmountWithOverApplied);
  }

  showDelinquencySection(): boolean {
    return this.loanProductService.isWorkingCapital
      ? this.hasWcDelinquencyFacts() || this.hasAvailableDisbursementAmount()
      : this.hasAvailableDisbursementAmount();
  }

  private buildTimelineSteps(): TimelineStep[] {
    const timeline = this.loanDetails?.timeline || {};
    const by = (firstname?: string, lastname?: string) =>
      [
        firstname,
        lastname
      ]
        .filter(Boolean)
        .join(' ');
    const steps: TimelineStep[] = [
      {
        label: 'Submitted on',
        date: timeline.submittedOnDate,
        by: by(timeline.submittedByFirstname, timeline.submittedByLastname),
        state: 'done'
      }
    ];
    if (timeline.rejectedOnDate) {
      steps.push({
        label: 'Rejected On',
        date: timeline.rejectedOnDate,
        by: by(timeline.rejectedByFirstname, timeline.rejectedByLastname),
        state: 'rejected'
      });
      return steps;
    }
    steps.push({
      label: 'Approved on',
      date: timeline.approvedOnDate,
      by: by(timeline.approvedByFirstname, timeline.approvedByLastname),
      state: timeline.approvedOnDate ? 'done' : 'pending'
    });
    steps.push({
      label: 'Disbursed on',
      date: timeline.actualDisbursementDate || timeline.expectedDisbursementDate,
      by: timeline.actualDisbursementDate ? by(timeline.disbursedByFirstname, timeline.disbursedByLastname) : '',
      state: timeline.actualDisbursementDate ? 'done' : 'pending'
    });
    if (timeline.closedOnDate) {
      steps.push({
        label: 'Closed On',
        date: timeline.closedOnDate,
        by: by(timeline.closedByFirstname, timeline.closedByLastname),
        state: 'done'
      });
    }
    const maturityDate = timeline.actualMaturityDate || timeline.expectedMaturityDate;
    if (maturityDate) {
      steps.push({
        label: 'Matures on',
        date: maturityDate,
        state: timeline.actualMaturityDate ? 'done' : 'pending'
      });
    }
    return steps;
  }
}
