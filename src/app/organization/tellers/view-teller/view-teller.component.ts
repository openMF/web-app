/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View Teller Component.
 */
@Component({
  selector: 'mifosx-view-teller',
  templateUrl: './view-teller.component.html',
  styleUrls: ['./view-teller.component.scss']
})
export class ViewTellerComponent implements OnInit {

  /** Teller data. */
  tellerData: any;

  /**
   * Retrieves the Teller data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { teller: any }) => {
      this.tellerData = data.teller;
    });
  }

  ngOnInit() {
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
        this.organizationService.deleteTeller(this.tellerData.id)
          .subscribe(() => {
            this.router.navigate(['/organization/tellers']);
          });
      }
    });
  }

}
