/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View accounting rule component.
 */
@Component({
  selector: 'mifosx-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.scss']
})
export class ViewRuleComponent implements OnInit {

  /** Accounting rule. */
  accountingRule: any;

  /**
   * Retrieves the accounting rule data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { accountingRule: any }) => {
      this.accountingRule = data.accountingRule;
    });
  }

  ngOnInit() {
  }

  /**
   * Deletes the accounting rule and redirects to accounting rules.
   */
  deleteAccountingRule() {
    const deleteAccountingRuleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `accounting rule ${this.accountingRule.id}` }
    });
    deleteAccountingRuleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteAccountingRule(this.accountingRule.id)
          .subscribe(() => {
            this.router.navigate(['/accounting/accounting-rules']);
          });
      }
    });
  }

}
