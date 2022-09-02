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
  showToolbar = false;
  /*To show popover on admin section in toolbar*/
  showToolbarAdmin = false;
  /*To show side navbar*/
  showSideNav = false;
  /*To show popover on chart of accounts section in sidenav bar*/
  showSideNavChartofAccounts = false;
  /*To show breadcrumbs*/
  showBreadcrumbs = false;
  /*To show home*/
  showHome = false;
  /*To show search activity in home*/
  showHomeSearchActivity = false;

  /**
   * Organization Setup
   */

  /*To show popover on manage offices on oganization page*/
  showCreateOffice = false;
  /*To show popover on button in offices page*/
  showOfficeList = false;
  /*To show popover on offices table*/
  showOfficeTable = false;
  /*To show popover on create office form*/
  showOfficeForm = false;
  /*To show popover on add edit currency on organization page*/
  showAddEditCurrency = false;
  /*To show popover on button in currency page*/
  showCurrencyPage = false;
  /*To show popover on currency table*/
  showCurrencyList = false;
  /*To show popover on currency form*/
  showCurrencyForm = false;
  /*To show popover on manage holiday on organization page*/
  showCreateHoliday = false;
  /*To show popover on button in holiday page*/
  showHolidayPage = false;
  /*To show popover on filter in holiday table*/
  showHolidayFilter = false;
  /*To show popover on manage employees on organization page*/
  showCreateEmployee = false;
  /*To show popover on button in employee page*/
  showEmployeeList = false;
  /*To show popover on employees table*/
  showEmployeeTable = false;
  /*To show popover on create employee form*/
  showEmployeeForm = false;
  /*To show popover on define working days*/
  showDefineWorkingDays = false;

  /**
   * System Setup
   */

  /*To show popover on manage datatables on system page*/
  showDatatables = false;
  /*To show popover on button in datatables page*/
  showDatatablesPage = false;
  /*To show popover on datatables table*/
  showDatatablesList = false;
  /*To show popover on create datable form*/
  showDatatablesForm = false;
  /*To show popover manage codes on system page*/
  showSystemCodes = false;
  /*To show popover on button in codes page*/
  showSystemCodesPage = false;
  /*To show popover on codes table*/
  showSystemCodesList = false;
  /*To show popover on create codes form*/
  showSystemCodesForm = false;
  /*To show popover on manage roles and permision on system page*/
  showRolesandPermission = false;
  /*To show popover on button in rolaes and permission page*/
  showRolesandPermissionPage = false;
  /*To show popover on roles and permission list*/
  showRolesandPermissionList = false;
  /*To show popover on button on user page*/
  showUsers = false;
  /*To show popover on users table*/
  showUsersList = false;
  /*To show popover on create user form*/
  showUsersForm = false;
  /*To show popover on maker checker table in system page*/
  showMakerCheckerTable = false;
  /*To show popover on button in make checker tasks page*/
  showMakerCheckerTablePage = false;
  /*To show popover on maker checker tasks table*/
  showMakerCheckerTableList = false;
  /*To show popover on global configuration in system page*/
  showConfigurations = false;
  /*To show popover on button in configuration page*/
  showConfigurationsPage = false;
  /*To show popover on button in configuration list*/
  showConfigurationsList = false;
  /*To show popover on manage scheduler jobs on system page*/
  showSchedulerJobs = false;
  /*To show popover on button in scheduler jobs page*/
  showSchedulerJobsPage = false;
  /*To show popover on scheduler jobs table*/
  showSchedulerJobsList = false;

  /**
   * Accounting Setup
   */

  /*To show popover on chart of accounts on accounting page*/
  showChartofAccounts = false;
  /*To show popover on button in chart of accounts page*/
  showChartofAccountsPage = false;
  /*To show popover on button in chart of accounts page*/
  showChartofAccountsList = false;
  /*To show popover on create chart of accounts form*/
  showChartofAccountsForm = false;
  /*To show popover on accounts linked on accounting page*/
  showAccountsLinked = false;
  /*To show popover on button in accounting page*/
  showAccountsLinkedPage = false;
  /*To show popover on accounts linked table*/
  showAccountsLinkedList = false;
  /*To show popover on migrate openening balances*/
  showMigrateOpeningBalances = false;
  /*To show popover on closing entries on accounting page*/
  showClosingEntries = false;
  /*To show popover on button in closing entries page*/
  showClosingEntriesPage = false;
  /*To show popover on closing entries table*/
  showClosingEntriesList = false;
  /*To show popover on create journal entry*/
  showCreateJournalEntries = false;

  /**
   * Products Setup
   */

  /*To show popover on charges on products page*/
  showCharges = false;
  /*To show popover on button in charges page*/
  showChargesPage = false;
  /*To show popover on charges table*/
  showChargesList = false;
  /*To show popover on loan products on products page*/
  showLoanProducts = false;
  /*To show popover on button in load products page*/
  showLoanProductsPage = false;
  /*To show popover on loan products table*/
  showLoanProductsList = false;
  /*To show popover on savings products on products page*/
  showSavingsProducts = false;
  /*To show popover on button in savings products page*/
  showSavingsProductsPage = false;
  /*To show popover on savings products table*/
  showSavingsProductsList = false;
  /*To show popover on shares products on products page*/
  showShareProducts = false;
  /*To show popover on button in share products page*/
  showShareProductsPage = false;
  /*To show popover on share products table*/
  showShareProductsList = false;
  /*To show popover on fixed deposit products on products page*/
  showFixedDepositProducts = false;
  /*To show popover on button in fixed deposit products page*/
  showFixedDepositProductsPage = false;
  /*To show popover on fixed deposit products table*/
  showFixedDepositProductsList = false;
  /*To show popover on recrurring deposit products on products page*/
  showRecurringDepositProducts = false;
  /*To show popover on button in recurring deposit products page*/
  showRecurringDepositProductsPage = false;
  /*To show popover on recurring deposit products table*/
  showRecurringDepositProductsList = false;

  /**
   * Manage Funds and manage reports Setup
   */

  /*To show popover on manage funds*/
  showManageFunds = false;
  /*To show popover on manage reports*/
  showManageReports = false;

  constructor() { }

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
