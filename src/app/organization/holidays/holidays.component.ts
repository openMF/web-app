/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Holidays component.
 */
@Component({
  selector: 'mifosx-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit, AfterViewInit {

  /** Office selector. */
  officeSelector = new UntypedFormControl();
  /** Holidays data. */
  holidaysData: any;
  /** Offices data. */
  officeData: any;
  /** Columns to be displayed in holidays table. */
  displayedColumns: string[] = ['name', 'fromDate', 'toDate', 'repaymentsRescheduledTo', 'status'];
  /** Data source for holidays table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for holidays table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for holidays table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create holiday button */
  @ViewChild('buttonCreateHoliday') buttonCreateHoliday: ElementRef<any>;
  /* Template for popover on create holiday button */
  @ViewChild('templateButtonCreateHoliday') templateButtonCreateHoliday: TemplateRef<any>;
  /* Reference of filter */
  @ViewChild('filterRef') filterRef: ElementRef<any>;
  /* Template to show popover on filter */
  @ViewChild('templateFilterRef') templateFilterRef: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Filters data in holidays table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Retrieves holidays data on changing office.
   */
  ngOnInit() {
    this.onChangeOffice();
  }

  /**
   * Retrieves the holidays data on changing office and sets the holidays table.
   */
  onChangeOffice() {
    this.officeSelector.valueChanges.subscribe((officeId = this.officeSelector.value) => {
      this.holidaysData = [];
      this.organizationService.getHolidays(officeId).subscribe((holidays: any) => {
        this.holidaysData = holidays.filter((holiday: any) => holiday.status.value !== 'Deleted');
        this.setHolidays();
      });
    });
  }

  /**
   * Initializes the data source, paginator and sorter for holidays table.
   */
  setHolidays() {
    this.dataSource = new MatTableDataSource(this.holidaysData);
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
    if (this.configurationWizardService.showHolidayPage === true) {
      setTimeout(() => {
          this.showPopover(this.templateButtonCreateHoliday, this.buttonCreateHoliday.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showHolidayFilter === true) {
      setTimeout(() => {
          this.showPopover(this.templateFilterRef, this.filterRef.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Create Employee) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showHolidayPage = false;
    this.configurationWizardService.showHolidayFilter = false;
    this.configurationWizardService.showCreateEmployee = true;
    this.router.navigate(['/organization']);
  }

  /**
   * Previous Step (Manage Holidays) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showHolidayPage = false;
    this.configurationWizardService.showHolidayFilter = false;
    this.configurationWizardService.showCreateHoliday = true;
    this.router.navigate(['/organization']);
  }
}
