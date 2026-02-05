/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Organization component.
 */
@Component({
  selector: 'mifosx-products',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatNavList,
    MatListItem,
    MatIcon,
    FaIconComponent,
    MatLine
  ]
})
export class OrganizationComponent implements AfterViewInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  shouldShowFundMapping = false;
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
  // Initialize an array of 18 boolean values, all set to false
  arrowBooleans: boolean[] = new Array(19).fill(false);

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   * @param arrowNumber - The index of the boolean value to toggle.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showCreateOffice) {
      setTimeout(() => {
        this.showPopover(this.templateOffice, this.office.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showAddEditCurrency) {
      setTimeout(() => {
        this.showPopover(this.templateAddEditCurrency, this.addEditCurrency.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showCreateHoliday) {
      setTimeout(() => {
        this.showPopover(this.templateHolidays, this.holidays.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showCreateEmployee) {
      setTimeout(() => {
        this.showPopover(this.templateEmployee, this.employee.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showDefineWorkingDays) {
      setTimeout(() => {
        this.showPopover(this.templateWorkingDays, this.workingDays.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showManageFunds) {
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

  arrowBooleansToggle(arrowNumber: number) {
    // Toggle the boolean value at the given index
    this.arrowBooleans[arrowNumber] = !this.arrowBooleans[arrowNumber];
  }
}
