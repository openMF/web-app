/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-recurring-deposit-product',
  templateUrl: './view-recurring-deposit-product.component.html',
  styleUrls: ['./view-recurring-deposit-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class ViewRecurringDepositProductComponent {
  private route = inject(ActivatedRoute);

  recurringDepositDatatables: any = [];

  constructor() {
    this.route.data.subscribe((data: { recurringDepositDatatables: any }) => {
      this.recurringDepositDatatables = [];
      data.recurringDepositDatatables.forEach((datatable: any) => {
        if (datatable.entitySubType === 'Recurring Deposit') {
          this.recurringDepositDatatables.push(datatable);
        }
      });
    });
  }
}
