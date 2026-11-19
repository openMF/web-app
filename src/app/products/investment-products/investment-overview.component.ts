/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { InvestmentProductService, investmentError } from './investment-product.service';
import { InvestmentAccessService } from './investment-access.service';
import { PolicyConfiguration } from './investment-product.models';
import { InvestmentCodePipe, InvestmentFeedbackComponent } from './investment-feedback.component';
@Component({
  selector: 'mifosx-investment-overview',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    InvestmentCodePipe,
    InvestmentFeedbackComponent
  ],
  templateUrl: './investment-overview.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentOverviewComponent implements OnInit {
  policyFields = [
    'minimumTermDays',
    'maximumTermDays',
    'termMultipleDays',
    'minimumInvestmentAmount',
    'maximumInvestmentAmount',
    'maximumReinvestments',
    'automaticReinvestmentEnabled',
    'capitalizationEligible',
    'capitalizationEnabled',
    'earlyCancellationAllowed',
    'penaltyFreeNonRenewalSupported',
    'renewalRatePolicy',
    'interestPayoutMode',
    'principalSettlementMode',
    'penaltyMode'
  ];
  mappingFields = [
    'mappingId',
    'financialAccountType',
    'glAccountId',
    'disabled',
    'classification',
    'usage',
    'paymentType',
    'chargeId'
  ];
  access = inject(InvestmentAccessService);
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  id = Number(inject(ActivatedRoute).snapshot.parent.paramMap.get('productId'));
  config = signal<PolicyConfiguration | null>(null);
  error = signal('');
  loading = signal(false);
  ngOnInit() {
    this.load();
  }
  load() {
    if (!this.access.has('READ_INVESTMENT_PRODUCT_POLICY')) {
      this.error.set('Investment.forbidden');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.service
      .getInvestmentConfiguration(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.config.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.loading.set(false);
        }
      });
  }
}
