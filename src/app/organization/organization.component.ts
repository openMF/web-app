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

  @ViewChild('office') office: ElementRef<any>;
  @ViewChild('templateOffice') templateOffice: TemplateRef<any>;
  @ViewChild('addEditCurrency') addEditCurrency: ElementRef<any>;
  @ViewChild('templateAddEditCurrency') templateAddEditCurrency: TemplateRef<any>;
  @ViewChild('holidays') holidays: ElementRef<any>;
  @ViewChild('templateHolidays') templateHolidays: TemplateRef<any>;
  @ViewChild('employee') employee: ElementRef<any>;
  @ViewChild('templateEmployee') templateEmployee: TemplateRef<any>;
  @ViewChild('workingDays') workingDays: ElementRef<any>;
  @ViewChild('templateWorkingDays') templateWorkingDays: TemplateRef<any>;
  @ViewChild('manageFunds') manageFunds: ElementRef<any>;
  @ViewChild('templateManageFunds') templateManageFunds: TemplateRef<any>;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

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

  nextStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showOfficeList = true;
    this.router.navigate(['/organization/offices']);
  }

  previousStepOffice() {
    this.configurationWizardService.showCreateOffice = false;
    this.configurationWizardService.showHomeSearchActivity = true;
    this.router.navigate(['/home']);
  }

  nextStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showCurrencyPage = true;
    this.router.navigate(['/organization/currencies']);
  }

  previousStepAddEditCurrency() {
    this.configurationWizardService.showAddEditCurrency = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  nextStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showHolidayPage = true;
    this.router.navigate(['/organization/holidays']);
  }

  previousStepHolidays() {
    this.configurationWizardService.showCreateHoliday = false;
    this.configurationWizardService.showCurrencyForm = true;
    this.router.navigate(['/organization/currencies/manage']);
  }

  nextStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showEmployeeList = true;
    this.router.navigate(['/organization/employees']);
  }

  previousStepEmployee() {
    this.configurationWizardService.showCreateEmployee = false;
    this.configurationWizardService.showHolidayFilter = true;
    this.router.navigate(['/organization/holidays']);
  }

  nextStepWorkingDays() {
    this.router.navigate(['/organization/working-days']);
  }

  previousStepWorkingDays() {
    this.configurationWizardService.showDefineWorkingDays = false;
    this.configurationWizardService.showEmployeeForm = true;
    this.router.navigate(['/organization/employees/create']);
  }

  nextStepManageFunds() {
    this.router.navigate(['/organization/manage-funds']);
  }

  previousStepManageFunds() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showRecurringDepositProductsList = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }
}
