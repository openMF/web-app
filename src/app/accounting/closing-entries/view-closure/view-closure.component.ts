/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View closure component.
 */
@Component({
  selector: 'mifosx-view-closure',
  templateUrl: './view-closure.component.html',
  styleUrls: ['./view-closure.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewClosureComponent {
  /** GL Account closure. */
  glAccountClosure: any;

  /**
   * Retrieves the gl account closure data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private accountingService: AccountingService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { glAccountClosure: any }) => {
      this.glAccountClosure = data.glAccountClosure;
    });
  }

  /**
   * Deletes the gl account closure and redirects to closing entries.
   */
  deleteAccountingClosure() {
    const deleteAccountingClosureDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `accounting closure ${this.glAccountClosure.id}` }
    });
    deleteAccountingClosureDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteAccountingClosure(this.glAccountClosure.id).subscribe(() => {
          this.router.navigate(['/accounting/closing-entries']);
        });
      }
    });
  }
}
