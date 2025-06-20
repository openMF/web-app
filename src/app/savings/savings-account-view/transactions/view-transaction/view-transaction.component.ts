/** Angular Imports */
import { Component } from '@angular/core';
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
  /** Transaction data. */
  transactionData: any;

  accountId: any;
  /** Transaction Data Tables */
  entityDatatables: any;

  /**
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { transactionDatatables: any }) => {
      this.accountId = this.route.snapshot.params['savingAccountId'];
      this.entityDatatables = data.transactionDatatables;
    });
  }
}
