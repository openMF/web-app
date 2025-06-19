/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';

/**
 * View Cashier component.
 */
@Component({
  selector: 'mifosx-view-cashier',
  templateUrl: './view-cashier.component.html',
  styleUrls: ['./view-cashier.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    NgIf,
    MatCardActions,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    public dialog: MatDialog
  ) {
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
