/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { Location } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { GlAccountDisplayComponent } from '../../../shared/accounting/gl-account-display/gl-account-display.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View financial activity mapping component.
 */
@Component({
  selector: 'mifosx-view-financial-activity-mapping',
  templateUrl: './view-financial-activity-mapping.component.html',
  styleUrls: ['./view-financial-activity-mapping.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    GlAccountDisplayComponent
  ]
})
export class ViewFinancialActivityMappingComponent {
  /** Financial activity account ID. */
  financialActivityAccountId: any;
  /** Financial activity account data. */
  financialActivityAccount: any;

  /**
   * Retrieves the financial activity account data from `resolve`.
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
    this.route.data.subscribe((data: { financialActivityAccount: any }) => {
      this.financialActivityAccount = data.financialActivityAccount;
      this.financialActivityAccountId = data.financialActivityAccount.id;
    });
  }

  /**
   * Deletes the financial activity account and redirects to financial activity mappings.
   */
  deleteFinancialActivityAccount() {
    const deleteFinancialActivityAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `financial activity mapping ${this.financialActivityAccountId}` }
    });
    deleteFinancialActivityAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteFinancialActivityAccount(this.financialActivityAccountId).subscribe(() => {
          this.router.navigate(['/accounting/financial-activity-mappings']);
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
