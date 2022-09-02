/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

/**
 * Organization component.
 */
@Component({
  selector: 'mifosx-products',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, AfterViewInit {

  /* Reference of manage offices */
  @ViewChild('office') office: ElementRef<any>;
  /* Template for popover on manage offices */
  @ViewChild('templateOffice') templateOffice: TemplateRef<any>;
  /* Reference of add/edit currency */
  @ViewChild('addEditCurrency') addEditCurrency: ElementRef<any>;
  /* Template for popover on add/edit currency */
  @ViewChild('templateAddEditCurrency') templateAddEditCurrency: TemplateRef<any>;
  /* Reference of manage holidays */
  @ViewChild('holidays') holidays: ElementRef<any>;
  /* Template for popover on manage holidays */
  @ViewChild('templateHolidays') templateHolidays: TemplateRef<any>;
  /* Reference of manage employees */
  @ViewChild('employee') employee: ElementRef<any>;
  /* Template for popover on manage employee */
  @ViewChild('templateEmployee') templateEmployee: TemplateRef<any>;
  /* Reference of define working days */
  @ViewChild('workingDays') workingDays: ElementRef<any>;
  /* Template for popover on define working days */
  @ViewChild('templateWorkingDays') templateWorkingDays: TemplateRef<any>;
  /* Reference of manage funds */
  @ViewChild('manageFunds') manageFunds: ElementRef<any>;
  /* Template for popover on manage funds */
  @ViewChild('templateManageFunds') templateManageFunds: TemplateRef<any>;

  /**
   * @param {ActivatedRoute} activatedRoute ActivatedRoute.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
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
    if (this.configurationWizardService.showCreateOffice === true) {
      setTimeout(() => {
          this.showPopover(this.templateOffice, this.office.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showAddEditCurrency === true) {
      setTimeout(() => {
          this.showPopover(this.templateAddEditCurrency, this.addEditCurrency.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showCreateHoliday === true) {
      setTimeout(() => {
          this.showPopover(this.templateHolidays, this.holidays.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showCreateEmployee === true) {
      setTimeout(() => {
          this.showPopover(this.templateEmployee, this.employee.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showDefineWorkingDays === true) {
      setTimeout(() => {
          this.showPopover(this.templateWorkingDays, this.workingDays.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showManageFunds === true) {
      setTimeout(() => {
          this.showPopover(this.templateManageFunds, this.manageFunds.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Manage Offices Page) Configuration Wizard.
   */
  nextStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showOfficeList = true;
    this.router.navigate(['/organization/offices']);
  }

  /**
   * Previous Step (Home component) Configuration Wizard.
   */
  previousStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showHomeSearchActivity = true;
    this.router.navigate(['/home']);
  }

  /**
   * Next Step (Add/Edit Currency Page) Configuration Wizard.
   */
  nextStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showCurrencyPage = true;
    this.router.navigate(['/organization/currencies']);
  }

  /**
   * Previous Step (Office Form) Configuration Wizard.
   */
  previousStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  /**
   * Next Step (manage Holidays Page) Configuration Wizard.
   */
  nextStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showHolidayPage = true;
    this.router.navigate(['/organization/holidays']);
  }

  /**
   * Previous Step (Currency Form) Configuration Wizard.
   */
  previousStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showCurrencyForm = true;
    this.router.navigate(['/organization/currencies/manage']);
  }

  /**
   * Next Step (Manage Employees Page) Configuration Wizard.
   */
  nextStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showEmployeeList = true;
    this.router.navigate(['/organization/employees']);
  }

  /**
   * Previous Step (Holiday Form) Configuration Wizard.
   */
  previousStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showHolidayFilter = true;
    this.router.navigate(['/organization/holidays']);
  }

  /**
   * Next Step (Define Working Days Page) Configuration Wizard.
   */
  nextStepWorkingDays() {
    this.router.navigate(['/organization/working-days']);
  }

  /**
   * Previous Step (Employee Form) Configuration Wizard.
   */
  previousStepWorkingDays() {
    this.configurationWizardService.showDefineWorkingDays = false;
    this.configurationWizardService.showEmployeeForm = true;
    this.router.navigate(['/organization/employees/create']);
  }

  /**
   * Next Step (Manage Funds Page) Configuration Wizard.
   */
  nextStepManageFunds() {
    this.router.navigate(['/organization/manage-funds']);
  }

  /**
   * Previous Step (Recurring Deposit Page) Configuration Wizard.
   */
  previousStepManageFunds() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showRecurringDepositProductsList = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }
}
