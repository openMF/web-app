/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * View gl account component.
 */
@Component({
  selector: 'mifosx-view-gl-account',
  templateUrl: './view-gl-account.component.html',
  styleUrls: ['./view-gl-account.component.scss']
})
export class ViewGlAccountComponent implements OnInit {

  /** GL Account. */
  glAccount: any;

  /**
   * Retrieves the gl account data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { glAccountAndChartOfAccountsTemplate: any }) => {
      this.glAccount = data.glAccountAndChartOfAccountsTemplate;
    });
  }

  ngOnInit() {
  }

  /**
   * Deletes the gl account and redirects to chart of accounts.
   */
  deleteGlAccount() {
    const deleteGlAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `gl account ${this.glAccount.id}` }
    });
    deleteGlAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteGlAccount(this.glAccount.id)
          .subscribe(() => {
            this.router.navigate(['/accounting/chart-of-accounts']);
          });
      }
    });
  }

  /**
   * Changes state of gl account. (enabled/disabled)
   */
  changeGlAccountState() {
    this.accountingService.updateGlAccount(this.glAccount.id, { disabled: !this.glAccount.disabled })
      .subscribe((response: any) => {
        this.glAccount.disabled = response.changes.disabled;
      });
  }

}
