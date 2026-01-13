/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Cashier component.
 */
@Component({
  selector: 'mifosx-view-cashier',
  templateUrl: './view-cashier.component.html',
  styleUrls: ['./view-cashier.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe
  ]
})
export class ViewCashierComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private organizationService = inject(OrganizationService);
  dialog = inject(MatDialog);

  /** Cashier data. */
  cashierData: any;

  /**
   * Get cashier data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router
   * @param {OrganizationService} organizationService Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor() {
    this.route.data.subscribe((data: { cashier: any }) => {
      this.cashierData = data.cashier;
    });
  }

  /**
   * Deletes the cashier.
   */
  deleteCashier() {
    const deleteCashierDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Cashier id: ${this.cashierData.id}` }
    });
    deleteCashierDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteCashier(this.cashierData.tellerId, this.cashierData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
}
