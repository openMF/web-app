/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View financial activity mapping component.
 */
@Component({
  selector: 'mifosx-view-financial-activity-mapping',
  templateUrl: './view-financial-activity-mapping.component.html',
  styleUrls: ['./view-financial-activity-mapping.component.scss']
})
export class ViewFinancialActivityMappingComponent implements OnInit {

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
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { financialActivityAccount: any }) => {
      this.financialActivityAccount = data.financialActivityAccount;
      this.financialActivityAccountId = data.financialActivityAccount.id;
    });
  }

  ngOnInit() {
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
        this.accountingService.deleteFinancialActivityAccount(this.financialActivityAccountId)
          .subscribe(() => {
            this.router.navigate(['/accounting/financial-activity-mappings']);
          });
      }
    });
  }

}
