/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

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
   @ViewChild(MatPaginator) paginator: MatPaginator;
   /** Sorter for reports table. */
   @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonCreateReport') buttonCreateReport: ElementRef<any>;
  @ViewChild('templateButtonCreateReport') templateButtonCreateReport: TemplateRef<any>;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
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

  ngAfterViewInit() {
    if (this.configurationWizardService.showManageReports === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateReport, this.buttonCreateReport.nativeElement, 'bottom', true);
      });
    }
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  nextStep() {
    this.configurationWizardService.showManageReports = false;
    this.router.navigate(['/home']);
  }

  previousStep() {
    this.router.navigate(['/system']);
  }
}
