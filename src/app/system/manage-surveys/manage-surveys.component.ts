/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../system.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Surveys component.
 */
@Component({
  selector: 'mifosx-manage-surveys',
  templateUrl: './manage-surveys.component.html',
  styleUrls: ['./manage-surveys.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ManageSurveysComponent implements OnInit {
  /* Surveys data */
  surveysData: any;
  /* Columns to be displayed in manage surveys data table */
  displayedColumns: string[] = [
    'key',
    'name',
    'description',
    'countryCode',
    'status',
    'action'
  ];
  /* Data source for manage surveys data table */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage surveys table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage surveys table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the surveys data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService
  ) {
    this.route.data.subscribe((data: { surveys: any }) => {
      this.surveysData = data.surveys;
    });
  }

  /**
   * Returns whether an survey is active based on its duration
   * @param {string} validFrom Date valid from (yyyy-MM-dd)
   * @param {string} validTo Date valid to (yyyy-MM-dd)
   */
  isActive(validFrom: string, validTo: string) {
    const curdate = new Date().toISOString().split('T')[0];
    return curdate >= validFrom && curdate <= validTo;
  }

  /**
   * Sets the manage surveys table. And initiates button and action sort
   */
  ngOnInit() {
    this.setSurveys();
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'status':
          return this.isActive(item.validFrom, item.validTo);
        case 'action':
          return this.isActive(item.validFrom, item.validTo);
        default:
          return item[property];
      }
    };
  }

  /**
   * Initializes the data source, paginator and sorter for surveys table.
   */
  setSurveys() {
    this.dataSource = new MatTableDataSource(this.surveysData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in surveys table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Activates a survey.
   * @param {any} survey Survey to activate.
   */
  activate(survey: any) {
    this.systemService.activateSurvey(survey.id).subscribe(() => {
      const today = new Date().toISOString().split('T')[0];
      // This mimics the server-side logic
      survey.validFrom = today;
      survey.validTo = today;
    });
  }

  /**
   * Deactivates a survey.
   * @param {any} survey Survey to deactivate.
   */
  deactivate(survey: any) {
    this.systemService.deactivateSurvey(survey.id).subscribe(() => {
      const date = new Date();
      date.setDate(date.getDate() - 1); // Set to yesterday
      const yesterday = date.toISOString().split('T')[0];
      // This mimics the server-side logic
      survey.validTo = yesterday;
    });
  }
}
