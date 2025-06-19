/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf, TitleCasePipe } from '@angular/common';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Teller Component.
 */
@Component({
  selector: 'mifosx-view-teller',
  templateUrl: './view-teller.component.html',
  styleUrls: ['./view-teller.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    TitleCasePipe,
    DateFormatPipe
  ]
})
export class ViewTellerComponent {
  /** Teller data. */
  tellerData: any;

  /**
   * Retrieves the Teller data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { teller: any }) => {
      this.tellerData = data.teller;
    });
  }

  /**
   * Deletes the teller and redirects to tellers.
   */
  deleteTeller() {
    const deleteTellerDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `teller ${this.tellerData.id}` }
    });
    deleteTellerDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteTeller(this.tellerData.id).subscribe(() => {
          this.router.navigate(['/organization/tellers']);
        });
      }
    });
  }
}
