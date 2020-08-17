/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * View Cashier component.
 */
@Component({
  selector: 'mifosx-view-cashier',
  templateUrl: './view-cashier.component.html',
  styleUrls: ['./view-cashier.component.scss']
})
export class ViewCashierComponent {

  /** Cashier data. */
  cashierData: any;

  /**
   * Get cashier data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router
   * @param {OrganizationService} organizationService Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private organizationService: OrganizationService,
              public dialog: MatDialog) {
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
          this.router.navigate(['../'], {relativeTo: this.route});
        });
      }
    });
  }

}
