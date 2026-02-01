/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';

/**
 * Configuration Wizard service.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigurationWizardService {
  /**
   * Home Tour
   */

  /*To show toolbar*/
  showToolbar: boolean = false;
  /*To show popover on admin section in toolbar*/
  showToolbarAdmin: boolean = false;
  /*To show side navbar*/
  showSideNav: boolean = false;
  /*To show popover on chart of accounts section in sidenav bar*/
  showSideNavChartofAccounts: boolean = false;
  /*To show breadcrumbs*/
  showBreadcrumbs: boolean = false;
  /*To show home*/
  showHome: boolean = false;
  /*To show search activity in home*/
  showHomeSearchActivity: boolean = false;

  /**
   * Organization Setup
   */

  /*To show popover on manage offices on oganization page*/
  showCreateOffice: boolean = false;
  /*To show popover on button in offices page*/
  showOfficeList: boolean = false;
  /*To show popover on offices table*/
  showOfficeTable: boolean = false;
  /*To show popover on create office form*/
  showOfficeForm: boolean = false;
  /*To show popover on add edit currency on organization page*/
  showAddEditCurrency: boolean = false;
  /*To show popover on button in currency page*/
  showCurrencyPage: boolean = false;
  /*To show popover on currency table*/
  showCurrencyList: boolean = false;
  /*To show popover on currency form*/
  showCurrencyForm: boolean = false;
  /*To show popover on manage holiday on organization page*/
  showCreateHoliday: boolean = false;
  /*To show popover on button in holiday page*/
  showHolidayPage: boolean = false;
  /*To show popover on filter in holiday table*/
  showHolidayFilter: boolean = false;
  /*To show popover on manage employees on organization page*/
  showCreateEmployee: boolean = false;
  /*To show popover on button in employee page*/
  showEmployeeList: boolean = false;
  /*To show popover on employees table*/
  showEmployeeTable: boolean = false;
  /*To show popover on create employee form*/
  showEmployeeForm: boolean = false;
  /*To show popover on define working days*/
  showDefineWorkingDays: boolean = false;

  /**
   * System Setup
   */

  /*To show popover on manage datatables on system page*/
  showDatatables: boolean = false;
  /*To show popover on button in datatables page*/
  showDatatablesPage: boolean = false;
  /*To show popover on datatables table*/
  showDatatablesList: boolean = false;
  /*To show popover on create datable form*/
  showDatatablesForm: boolean = false;
  /*To show popover manage codes on system page*/
  showSystemCodes: boolean = false;
  /*To show popover on button in codes page*/
  showSystemCodesPage: boolean = false;
  /*To show popover on codes table*/
  showSystemCodesList: boolean = false;
  /*To show popover on create codes form*/
  showSystemCodesForm: boolean = false;
  /*To show popover on manage roles and permision on system page*/
  showRolesandPermission: boolean = false;
  /*To show popover on button in rolaes and permission page*/
  showRolesandPermissionPage: boolean = false;
  /*To show popover on roles and permission list*/
  showRolesandPermissionList: boolean = false;
  /*To show popover on button on user page*/
  showUsers: boolean = false;
  /*To show popover on users table*/
  showUsersList: boolean = false;
  /*To show popover on create user form*/
  showUsersForm: boolean = false;
  /*To show popover on maker checker table in system page*/
  showMakerCheckerTable: boolean = false;
  /*To show popover on button in make checker tasks page*/
  showMakerCheckerTablePage: boolean = false;
  /*To show popover on maker checker tasks table*/
  showMakerCheckerTableList: boolean = false;
  /*To show popover on global configuration in system page*/
  showConfigurations: boolean = false;
  /*To show popover on button in configuration page*/
  showConfigurationsPage: boolean = false;
  /*To show popover on button in configuration list*/
  showConfigurationsList: boolean = false;
  /*To show popover on manage scheduler jobs on system page*/
  showSchedulerJobs: boolean = false;
  /*To show popover on button in scheduler jobs page*/
  showSchedulerJobsPage: boolean = false;
  /*To show popover on scheduler jobs table*/
  showSchedulerJobsList: boolean = false;

  /**
   * Accounting Setup
   */

  /*To show popover on chart of accounts on accounting page*/
  showChartofAccounts: boolean = false;
  /*To show popover on button in chart of accounts page*/
  showChartofAccountsPage: boolean = false;
  /*To show popover on button in chart of accounts page*/
  showChartofAccountsList: boolean = false;
  /*To show popover on create chart of accounts form*/
  showChartofAccountsForm: boolean = false;
  /*To show popover on accounts linked on accounting page*/
  showAccountsLinked: boolean = false;
  /*To show popover on button in accounting page*/
  showAccountsLinkedPage: boolean = false;
  /*To show popover on accounts linked table*/
  showAccountsLinkedList: boolean = false;
  /*To show popover on migrate openening balances*/
  showMigrateOpeningBalances: boolean = false;
  /*To show popover on closing entries on accounting page*/
  showClosingEntries: boolean = false;
  /*To show popover on button in closing entries page*/
  showClosingEntriesPage: boolean = false;
  /*To show popover on closing entries table*/
  showClosingEntriesList: boolean = false;
  /*To show popover on create journal entry*/
  showCreateJournalEntries: boolean = false;

  /**
   * Products Setup
   */

  /*To show popover on charges on products page*/
  showCharges: boolean = false;
  /*To show popover on button in charges page*/
  showChargesPage: boolean = false;
  /*To show popover on charges table*/
  showChargesList: boolean = false;
  /*To show popover on loan products on products page*/
  showLoanProducts: boolean = false;
  /*To show popover on button in load products page*/
  showLoanProductsPage: boolean = false;
  /*To show popover on loan products table*/
  showLoanProductsList: boolean = false;
  /*To show popover on savings products on products page*/
  showSavingsProducts: boolean = false;
  /*To show popover on button in savings products page*/
  showSavingsProductsPage: boolean = false;
  /*To show popover on savings products table*/
  showSavingsProductsList: boolean = false;
  /*To show popover on shares products on products page*/
  showShareProducts: boolean = false;
  /*To show popover on button in share products page*/
  showShareProductsPage: boolean = false;
  /*To show popover on share products table*/
  showShareProductsList: boolean = false;
  /*To show popover on fixed deposit products on products page*/
  showFixedDepositProducts: boolean = false;
  /*To show popover on button in fixed deposit products page*/
  showFixedDepositProductsPage: boolean = false;
  /*To show popover on fixed deposit products table*/
  showFixedDepositProductsList: boolean = false;
  /*To show popover on recrurring deposit products on products page*/
  showRecurringDepositProducts: boolean = false;
  /*To show popover on button in recurring deposit products page*/
  showRecurringDepositProductsPage: boolean = false;
  /*To show popover on recurring deposit products table*/
  showRecurringDepositProductsList: boolean = false;

  /**
   * Manage Funds and manage reports Setup
   */

  /*To show popover on manage funds*/
  showManageFunds: boolean = false;
  /*To show popover on manage reports*/
  showManageReports: boolean = false;

  constructor() {}

  /**
   * Set all variables to false.
   */
  closeConfigWizard(): void {
    this.showToolbar = false;
    this.showToolbarAdmin = false;
    this.showSideNav = false;
    this.showSideNavChartofAccounts = false;
    this.showBreadcrumbs = false;
    this.showHome = false;
    this.showHomeSearchActivity = false;

    this.showCreateOffice = false;
    this.showOfficeList = false;
    this.showOfficeTable = false;
    this.showOfficeForm = false;
    this.showAddEditCurrency = false;
    this.showCurrencyPage = false;
    this.showCurrencyList = false;
    this.showCurrencyForm = false;
    this.showCreateHoliday = false;
    this.showHolidayPage = false;
    this.showHolidayFilter = false;
    this.showCreateEmployee = false;
    this.showEmployeeList = false;
    this.showEmployeeTable = false;
    this.showEmployeeForm = false;
    this.showDefineWorkingDays = false;

    this.showDatatables = false;
    this.showDatatablesPage = false;
    this.showDatatablesList = false;
    this.showDatatablesForm = false;
    this.showSystemCodes = false;
    this.showSystemCodesPage = false;
    this.showSystemCodesList = false;
    this.showSystemCodesForm = false;
    this.showRolesandPermission = false;
    this.showRolesandPermissionPage = false;
    this.showRolesandPermissionList = false;
    this.showUsers = false;
    this.showUsersList = false;
    this.showUsersForm = false;
    this.showMakerCheckerTable = false;
    this.showMakerCheckerTablePage = false;
    this.showMakerCheckerTableList = false;
    this.showConfigurations = false;
    this.showConfigurationsPage = false;
    this.showConfigurationsList = false;
    this.showSchedulerJobs = false;
    this.showSchedulerJobsPage = false;
    this.showSchedulerJobsList = false;

    this.showChartofAccounts = false;
    this.showChartofAccountsPage = false;
    this.showChartofAccountsList = false;
    this.showChartofAccountsForm = false;
    this.showAccountsLinked = false;
    this.showAccountsLinkedPage = false;
    this.showAccountsLinkedList = false;
    this.showMigrateOpeningBalances = false;
    this.showClosingEntries = false;
    this.showClosingEntriesPage = false;
    this.showClosingEntriesList = false;
    this.showCreateJournalEntries = false;

    this.showCharges = false;
    this.showChargesPage = false;
    this.showChargesList = false;
    this.showLoanProducts = false;
    this.showLoanProductsPage = false;
    this.showLoanProductsList = false;
    this.showSavingsProducts = false;
    this.showSavingsProductsPage = false;
    this.showSavingsProductsList = false;
    this.showShareProducts = false;
    this.showShareProductsPage = false;
    this.showShareProductsList = false;
    this.showFixedDepositProducts = false;
    this.showFixedDepositProductsPage = false;
    this.showFixedDepositProductsList = false;
    this.showRecurringDepositProducts = false;
    this.showRecurringDepositProductsPage = false;
    this.showRecurringDepositProductsList = false;

    this.showManageFunds = false;
    this.showManageReports = false;
  }
}
