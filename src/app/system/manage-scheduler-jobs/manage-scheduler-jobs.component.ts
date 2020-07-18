/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { NextStepDialogComponent } from '../../configuration-wizard/next-step-dialog/next-step-dialog.component';

/**
 * Manage scheduler jobs component.
 */
@Component({
  selector: 'mifosx-manage-scheduler-jobs',
  templateUrl: './manage-scheduler-jobs.component.html',
  styleUrls: ['./manage-scheduler-jobs.component.scss']
})
export class ManageSchedulerJobsComponent implements OnInit, AfterViewInit {

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

  /** Paginator for table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for manage scheduler jobs table. */
  @ViewChild(MatSort) sort: MatSort;

  /* Reference of scheduler status */
  @ViewChild('schedulerStatus') schedulerStatus: ElementRef<any>;
  /* Template for popover on scheduler status */
  @ViewChild('templateSchedulerStatus') templateSchedulerStatus: TemplateRef<any>;
  /* Reference of jobs table */
  @ViewChild('jobsTable') jobsTable: ElementRef<any>;
  /* Template for popover on jobs table */
  @ViewChild('templateJobsTable') templateJobsTable: TemplateRef<any>;

  /**
   * Retrieves the scheduler jobs data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Matdialog} matdialog Matdialog.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe((data: { jobsScheduler: any }) => {
      this.jobData = data.jobsScheduler[0];
      this.schedulerData = data.jobsScheduler[1];
    });
  }

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
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'previousRunStatus': return item.lastRunHistory.status;
        case 'errorLog': return item.lastRunHistory.status;
        case 'previousRunTime': return new Date(item.lastRunHistory.jobRunStartTime);
        case 'nextRunTime': return new Date(item.nextRunTime);
        default: return item[property];
      }
    };
  }

  /**
   * Initializes the data source, paginator and sorter for manage scheduler jobs table.
   */
  setJobs() {
    this.dataSource = new MatTableDataSource(this.jobData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showSchedulerJobsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateSchedulerStatus, this.schedulerStatus.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSchedulerJobsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateJobsTable, this.jobsTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Opens Dialog for next step.
   */
  nextStep() {
    this.configurationWizardService.showSchedulerJobsPage = false;
    this.configurationWizardService.showSchedulerJobsList = false;
    this.openNextStepDialog();
  }

  /**
   * Previous Step (Scheduler Jobs) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showSchedulerJobsPage = false;
    this.configurationWizardService.showSchedulerJobsList = false;
    this.configurationWizardService.showSchedulerJobs = true;
    this.router.navigate(['/system']);
  }

  /**
   * Next Step (Accounting) Dialog Configuration Wizard.
   */
  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open( NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup Accounting',
        previousStepName: 'System',
        stepPercentage: 60
      },
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
    if (response.nextStep) {
      this.configurationWizardService.showSchedulerJobsPage = false;
      this.configurationWizardService.showSchedulerJobsList = false;
      this.configurationWizardService.showChartofAccounts = true;
      this.router.navigate(['/accounting']);
      } else {
      this.configurationWizardService.showSchedulerJobsPage = false;
      this.configurationWizardService.showSchedulerJobsList = false;
      this.router.navigate(['/home']);
      }
    });
  }
}
