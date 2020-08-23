/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * View Adhoc Query Component.
 */
@Component({
  selector: 'mifosx-view-adhoc-query',
  templateUrl: './view-adhoc-query.component.html',
  styleUrls: ['./view-adhoc-query.component.scss']
})
export class ViewAdhocQueryComponent implements OnInit {

  /** Adhoc query data. */
  adhocQueryData: any;

  /**
   * Retrieves the adhoc query data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { adhocQuery: any }) => {
      this.adhocQueryData = data.adhocQuery;
    });
  }

  ngOnInit() {
  }

  /**
   * Retrieves the report run frequency value from id
   * @returns {string} Report run frequency value.
   */
  get reportRunFrequency(): string {
    for (const reportRunFrequency of this.adhocQueryData.reportRunFrequencies) {
      if (reportRunFrequency.id === this.adhocQueryData.reportRunFrequency) {
        return reportRunFrequency.value;
      }
    }
  }

  /**
   * Deletes the adhoc query and redirects to adhoc queries.
   */
  deleteAdhocQuery() {
    const deleteAdhocQueryDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `adhoc query ${this.adhocQueryData.id}` }
    });
    deleteAdhocQueryDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteAdhocQuery(this.adhocQueryData.id)
        .subscribe(() => {
          this.router.navigate(['/organization/adhoc-query']);
        });
      }
    });
  }

}
