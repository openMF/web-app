/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Create Entity Data Table Checks component.
 */
@Component({
  selector: 'mifosx-view-scorecard-feature',
  templateUrl: './view-scorecard-feature.component.html',
  styleUrls: ['./view-scorecard-feature.component.scss']
})
export class ViewScorecardFeatureComponent implements OnInit {

  scorecardFeatureData: any;

  /**
   * Retrieves Entity Datatable Checks data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private route: ActivatedRoute,
              private organizationService: OrganizationService,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data) => {
      this.scorecardFeatureData = data.scorecard;
    });
  }

  ngOnInit() {
  }

  navigateBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  /**
   * Deletes the feature
   * @param {string} featureId Scorecard Feature ID of feature to be deleted.
   */
   deleteScorecardFeature(featureId: string) {
    const deleteScorecardFeaturesDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Scorecard Feature ${featureId}` }
    });
    deleteScorecardFeaturesDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteCreditScorecardFeature(featureId).subscribe(() => {
          this.navigateBack();
        });
      }
    });
  }

}
