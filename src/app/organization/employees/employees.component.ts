/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Employees component.
 */
@Component({
  selector: 'mifosx-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, AfterViewInit {

  /** Employees data. */
  employeesData: any;
  /** Columns to be displayed in employees table. */
  displayedColumns: string[] = ['displayName', 'isLoanOfficer', 'officeName', 'isActive'];
  /** Data source for employees table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for employees table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for employees table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of import employees button */
  @ViewChild('buttonImportEmployees') buttonImportEmployees: ElementRef<any>;
  /* Template for popover on import employees button */
  @ViewChild('templateButtonImportEmployees') templateButtonImportEmployees: TemplateRef<any>;
  /* Reference of employees table */
  @ViewChild('tableEmployees') tableEmployees: ElementRef<any>;
  /* Template for popover on employees table */
  @ViewChild('templateTableEmployees') templateTableEmployees: TemplateRef<any>;

  /**
   * Retrieves the employees data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { employees: any }) => {
      this.employeesData = data.employees;
    });
  }

  /**
   * Filters data in employees table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the employees table.
   */
  ngOnInit() {
    this.setEmployees();
  }

  /**
   * Initializes the data source, paginator and sorter for employees table.
   */
  setEmployees() {
    this.dataSource = new MatTableDataSource(this.employeesData);
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
    if (this.configurationWizardService.showEmployeeList === true) {
      setTimeout(() => {
          this.showPopover(this.templateButtonImportEmployees, this.buttonImportEmployees.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showEmployeeTable === true) {
      setTimeout(() => {
          this.showPopover(this.templateTableEmployees, this.tableEmployees.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create Employee Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showEmployeeList = false;
    this.configurationWizardService.showEmployeeTable = false;
    this.configurationWizardService.showEmployeeForm = true;
    this.router.navigate(['/organization/employees/create']);
  }

  /**
   * Previous Step (Manage Employees) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showEmployeeList = false;
    this.configurationWizardService.showEmployeeTable = false;
    this.configurationWizardService.showCreateEmployee = true;
    this.router.navigate(['/organization']);
  }

}
