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
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { BreachDisplayComponent } from 'app/shared/loan/breach-display/breach-display.component';
import { WorkingCapitalNearBreachActions } from 'app/loans/models/working-capital/working-capital-loan-account.model';

@Component({
  selector: 'mifosx-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    BreachDisplayComponent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent extends LoanProductBaseComponent {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  loanNearBreachActions: WorkingCapitalNearBreachActions[] = [];
  loanDetails: any;
  dataObject: {
    property: string;
    value: string;
  }[];

  constructor() {
    super();
    this.loanProductService.initialize(LoanProductBaseComponent.resolveProductTypeDefault(this.route, 'loan'));
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
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
}
