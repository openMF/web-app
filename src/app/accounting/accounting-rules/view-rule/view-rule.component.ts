/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View accounting rule component.
 */
@Component({
  selector: 'mifosx-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewRuleComponent {
  private accountingService = inject(AccountingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);

  /** Accounting rule. */
  accountingRule: any;

  /**
   * Retrieves the accounting rule data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
    this.route.data.subscribe((data: { accountingRule: any }) => {
      this.accountingRule = data.accountingRule;
    });
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
        this.accountingService.deleteAccountingRule(this.accountingRule.id).subscribe(() => {
          this.router.navigate(['/accounting/accounting-rules']);
        });
      }
    });
  }
}
