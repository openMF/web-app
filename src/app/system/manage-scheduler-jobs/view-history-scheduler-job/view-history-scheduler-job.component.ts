/** Angular Imports. */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from 'app/shared/error-dialog/error-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mifosx-view-history-scheduler-job',
  templateUrl: './view-history-scheduler-job.component.html',
  styleUrls: ['./view-history-scheduler-job.component.scss']
})
export class ViewHistorySchedulerJobComponent implements OnInit {

  /** Job History data. */
  jobHistoryData: any;
  /** Columns to be displayed in Scheduler Job History. */
  displayedColumns: string[] = ['version', 'run_start_time', 'status', 'run_type', 'error_log'];
  /** Data source for Scheduler Job History table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for Scheduler Job History table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for Scheduler Job History table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the scheduler Job History data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private router: Router ) {
    this.route.data.subscribe(( data: { jobsSchedulerHistory: any }) => {
      this.jobHistoryData = data.jobsSchedulerHistory;
      console.log(this.jobHistoryData);
    });
   }

  /**
   * Filters data in scheduler Job History table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    const filterObject = [{
      id: 'version',
      value: filterValue
    }];
    this.dataSource.filter = JSON.stringify(filterObject);
  }

  ngOnInit() {
    this.setJobHistory();
  }

  /**
   * Initializes the data source, paginator and sorter for scheduler Job History table.
   */
  setJobHistory() {
    this.dataSource = new MatTableDataSource(this.jobHistoryData.pageItems);
    this.dataSource.paginator = this.paginator;
    /** Search By Version */
    this.dataSource.filterPredicate =
    (data: any, filtersJson: string) => {
      const matchFilter: any[] = [];
      const filters = JSON.parse(filtersJson);
      filters.forEach((filter: any) => {
        const val = data[filter.id] === null ? '' : data[filter.id];
        if (filter.value !== '') {
          matchFilter.push(val === parseInt(filter.value, 10));
        } else if (filter.value === '') {
          matchFilter.push(val.toString().toLowerCase().includes(filter.value.toLowerCase()));
        }
      });
        return matchFilter.every(Boolean);
    };
  }

  /**
   * Open Error Dialog.
   * @param version version Id.
   */
  openError(version: any) {
    const openErrorLogDialog = this.dialog.open(ErrorDialogComponent, {
      width: '400px',
      data: this.jobHistoryData.pageItems.filter( (data: any) => data.version === version )[0].jobRunErrorLog
    });
    openErrorLogDialog.afterClosed().subscribe((response: any) => {
      this.router.navigate(['']);
    });
  }

}
