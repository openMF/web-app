/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    NgFor,
    HasPermissionDirective,
    MatTabNavPanel,
    RouterOutlet,
    TranslatePipe,
    NgxTranslatePipe
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
