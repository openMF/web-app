/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoanProduct } from '../../models/loan-product.model';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoanProductSummaryComponent } from '../../common/loan-product-summary/loan-product-summary.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from '../../common/loan-product-base.component';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    LoanProductSummaryComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralTabComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);

  loanProduct: LoanProduct;
  useDueForRepaymentsConfigurations = false;

  constructor() {
    super();
    this.route.data.subscribe((data) => {
      this.loanProduct = data.loanProduct;
      this.useDueForRepaymentsConfigurations =
        !this.loanProduct.dueDaysForRepaymentEvent && !this.loanProduct.overDueDaysForRepaymentEvent;
    });
  }

  ngOnInit() {
    this.loanProduct.allowAttributeConfiguration = Object.values(this.loanProduct.allowAttributeOverrides).some(
      (attribute: boolean) => attribute
    );
  }
}
