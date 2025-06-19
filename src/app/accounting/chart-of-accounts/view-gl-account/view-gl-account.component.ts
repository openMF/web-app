/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { Location, NgIf } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { GlAccountDisplayComponent } from '../../../shared/accounting/gl-account-display/gl-account-display.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

/**
 * View gl account component.
 */
@Component({
  selector: 'mifosx-view-gl-account',
  templateUrl: './view-gl-account.component.html',
  styleUrls: ['./view-gl-account.component.scss'],
  imports: [
    HasPermissionDirective,
    NgIf,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    GlAccountDisplayComponent,
    MatCardActions,
    TranslatePipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class ViewGlAccountComponent {
  /** GL Account. */
  glAccount: any;

  /**
   * Retrieves the gl account data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private accountingService: AccountingService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.route.data.subscribe((data: { glAccountAndChartOfAccountsTemplate: any }) => {
      this.glAccount = data.glAccountAndChartOfAccountsTemplate;
    });
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
        this.accountingService.deleteGlAccount(this.glAccount.id).subscribe(() => {
          this.router.navigate(['/accounting/chart-of-accounts']);
        });
      }
    });
  }

  /**
   * Changes state of gl account. (enabled/disabled)
   */
  changeGlAccountState() {
    this.accountingService
      .updateGlAccount(this.glAccount.id, { disabled: !this.glAccount.disabled })
      .subscribe((response: any) => {
        this.glAccount.disabled = response.changes.disabled;
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/accounting/chart-of-accounts');
  }
}
