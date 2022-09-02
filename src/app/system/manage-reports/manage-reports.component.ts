/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { CompletionDialogComponent } from '../../configuration-wizard/completion-dialog/completion-dialog.component';

/**
 * Manage Reports Component.
 */
@Component({
  selector: 'mifosx-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss']
})
export class ManageReportsComponent implements OnInit, AfterViewInit {

  /** Reports Data. */
  reportsData: any;
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = ['reportName', 'reportType', 'reportSubType', 'reportCategory', 'coreReport', 'userReport'];
  /** Data source for reports table. */
  dataSource: MatTableDataSource<any>;

   /** Paginator for reports table. */
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
   /** Sorter for reports table. */
   @ViewChild(MatSort, { static: true }) sort: MatSort;

   /* Reference of Create Report Button */
   @ViewChild('buttonCreateReport') buttonCreateReport: ElementRef<any>;
   /* Template for popover on Create Report Button */
   @ViewChild('templateButtonCreateReport') templateButtonCreateReport: TemplateRef<any>;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   * @param {Matdialog} matdialog Matdialog.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { reports: any }) => {
      this.reportsData = data.reports;
    });
  }

  /**
   * Sets the reports table.
   */
  ngOnInit() {
    this.setReports();
  }

  /**
   * Initializes the data source, paginator and sorter for reports table.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in reports table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showManageReports === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateReport, this.buttonCreateReport.nativeElement, 'bottom', true);
      });
    }
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
   * Next Step (Home) Configuration Wizard Tour Complete.
   */
  nextStep() {
    this.configurationWizardService.showManageReports = false;
    this.openNextStepDialog();
  }

  /**
   * Previous Step (Manage Reports System Page) Configuration Wizard.
   */
  previousStep() {
    this.router.navigate(['/system']);
  }

  /**
   * Completed Configuration Wizard Tour Dialog.
   */
  openNextStepDialog() {
    const completionDialogRef = this.dialog.open( CompletionDialogComponent );
    completionDialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
}
