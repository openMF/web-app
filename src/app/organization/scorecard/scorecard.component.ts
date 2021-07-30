/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';

/**
 * Scorecard Features component.
 */
@Component({
  selector: 'mifosx-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.scss']
})
export class ScorecardComponent implements OnInit {

  scorecardFeaturesData: any;

  displayedColumns: string[] = ['feature', 'valueType', 'dataType', 'category', 'status', 'actions'];

  dataSource: MatTableDataSource<any>;

  /** Paginator for scorecard features table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for entity data table checks table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the scorecard features data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.route.data.subscribe(( data) => {
      this.scorecardFeaturesData = data.scorecard;
    });
  }

  /**
   * Filters data in scorecard features table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the scorecard features table.
   */
  ngOnInit() {
    this.setScorecardFeatures();
  }

  /**
   * Initializes the data source, paginator and sorter for scorecard features table.
   */
  setScorecardFeatures() {
    this.dataSource = new MatTableDataSource(this.scorecardFeaturesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'status': return item.status.value;
        default: return item[property];
      }
    };
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
        this.organizationService.deleteCreditScorecardFeature(featureId)
          .subscribe(() => {
            this.scorecardFeaturesData = this.scorecardFeaturesData.filter((scorecardFeature: any) => scorecardFeature.id !== featureId);
            this.dataSource.data = this.scorecardFeaturesData;
          });
      }
    });
  }

}
