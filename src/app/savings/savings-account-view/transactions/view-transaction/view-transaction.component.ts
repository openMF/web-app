/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class ViewTransactionComponent {
  private route = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  /** Transaction data. */
  transactionData: any;

  accountId: any;
  /** Transaction Data Tables */
  entityDatatables: any;

  /**
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
    this.route.data.subscribe((data: { transactionDatatables: any }) => {
      this.accountId = this.route.snapshot.params['savingAccountId'];
      this.entityDatatables = data.transactionDatatables;
    });
  }
}
