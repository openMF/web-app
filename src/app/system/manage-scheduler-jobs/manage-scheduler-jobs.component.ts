/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

/** rxjs Imports */
import { of } from 'rxjs';
import { SystemService } from '../system.service';

/**
 * Manage scheduler jobs component.
 */
@Component({
  selector: 'mifosx-manage-scheduler-jobs',
  templateUrl: './manage-scheduler-jobs.component.html',
  styleUrls: ['./manage-scheduler-jobs.component.scss']
})
export class ManageSchedulerJobsComponent implements OnInit {

  /** Jobs data. */
  jobData: any;
  /** Scheduler data */
  schedulerData: any;
  /** Columns to be displayed in manage scheduler jobs table. */
  displayedColumns: string[] = ['select', 'displayName', 'nextRunTime', 'previousRunTime', 'previousRunStatus', 'currentlyRunning', 'errorLog'];
  /** Data source for manage scheduler jobs table. */
  dataSource: MatTableDataSource<any>;
  /** Initialize Selection */
  selection = new SelectionModel<any>(true, []);
  /** Scheduler Status */
  schedulerActive = false;
  /** Jobs counter */
  jobsCounter: any = 0;

  /** Paginator for table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage scheduler jobs table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the scheduler jobs data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Filters data in manage scheduler jobs table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected === this.jobsCounter;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /**
   * Sets the manage scheduler jobs table.
   */
  ngOnInit() {
    this.setJobs();
    this.getScheduler();
  }

  /**
   * Initializes the data source, paginator and sorter for manage scheduler jobs table.
   */
  setJobs() {
    this.systemService.getJobs()
    .subscribe((jobData: any) => {
      this.dataSource = new MatTableDataSource(jobData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.jobsCounter = jobData.length;
      this.selection.clear();
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'previousRunStatus': return item.lastRunHistory.status;
          case 'errorLog': return item.lastRunHistory.status;
          case 'previousRunTime': return new Date(item.lastRunHistory.jobRunStartTime);
          case 'nextRunTime': return new Date(item.nextRunTime);
          default: return item[property];
        }
      };
    });
  }

  getScheduler() {
    this.systemService.getScheduler()
    .subscribe((schedulerData: any) => {
      this.schedulerData = schedulerData;
      this.schedulerActive = this.schedulerData.active;
    });
  }

  suspendScheduler(): void {
    this.systemService.runCommandOnScheduler('stop')
    .subscribe(() => {
      this.getScheduler();
    });
  }

  activateScheduler(): void {
    this.systemService.runCommandOnScheduler('start')
    .subscribe(() => {
      this.getScheduler();
    });
  }

  runSelectedJobs(): void {
    this.selection.selected.forEach((job) => {
      this.systemService.runSelectedJob(job.jobId);
    });
  }

  refresh(): void {
    this.setJobs();
  }
}
