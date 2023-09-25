/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { SystemService } from '../../system.service';

/** Custom Services */
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { NextStepDialogComponent } from '../../../configuration-wizard/next-step-dialog/next-step-dialog.component';
import { CustomParametersPopoverComponent } from './custom-parameters-popover/custom-parameters-popover.component';

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
  displayedColumns: string[] = ['select', 'displayName', 'active', 'nextRunTime', 'previousRunTime', 'previousRunStatus', 'currentlyRunning', 'errorLog'];
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

  /* Reference of scheduler status */
  @ViewChild('schedulerStatus', { static: true }) schedulerStatus: ElementRef<any>;
  /* Template for popover on scheduler status */
  @ViewChild('templateSchedulerStatus', { static: true }) templateSchedulerStatus: TemplateRef<any>;
  /* Reference of jobs table */
  @ViewChild('jobsTable', { static: true }) jobsTable: ElementRef<any>;
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
    private systemService: SystemService,
    private router: Router,
    private dialog: MatDialog,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService) {
    this.route.data.subscribe((data: { jobsScheduler: any }) => {
      if (data.jobsScheduler) {
        this.jobData = data.jobsScheduler[0];
        this.schedulerData = data.jobsScheduler[1];
      }
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

  isAnyJobSelected(): boolean {
    return (this.selection.selected.length > 0);
  }

  runSelectedJobs(): void {
    this.selection.selected.forEach((job) => {
      this.systemService.runSelectedJob(job.jobId);
    });
  }

  refresh(): void {
    this.setJobs();
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
    const nextStepDialogRef = this.dialog.open(NextStepDialogComponent, {
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

  /**
   * Open Custom Parameters Dialog
   */
  openCustomParametersDialog() {
    this.dialog.open(CustomParametersPopoverComponent, {
      data: {
        selectedJobs: this.selection
      }
    });
  }

}
