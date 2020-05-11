import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ConfigurationWizardService {

  showToolbar = false;
  showToolbarAdmin = false;
  showSideNav = false;
  showSideNavChartofAccounts = false;
  showBreadcrumbs = false;
  showHome = false;
  showHomeSearchActivity = false;

  showCreateOffice = false;
  showOfficeList = false;
  showOfficeTable = false;
  showOfficeForm = false;
  showAddEditCurrency = false;
  showCurrencyPage = false;
  showCurrencyList = false;
  showCurrencyForm = false;
  showCreateHoliday = false;
  showHolidayPage = false;
  showHolidayFilter = false;
  showCreateEmployee = false;
  showEmployeeList = false;
  showEmployeeTable = false;
  showEmployeeForm = false;
  showDefineWorkingDays = false;

  showDatatables = false;
  showDatatablesPage = false;
  showDatatablesList = false;
  showDatatablesForm = false;
  showSystemCodes = false;
  showSystemCodesPage = false;
  showSystemCodesList = false;
  showSystemCodesForm = false;
  showRolesandPermission = false;
  showRolesandPermissionPage = false;
  showRolesandPermissionList = false;
  showUsers = false;
  showUsersList = false;
  showUsersForm = false;
  showMakerCheckerTable = false;
  showMakerCheckerTablePage = false;
  showMakerCheckerTableList = false;
  showConfigurations = false;
  showConfigurationsPage = false;
  showConfigurationsList = false;
  showSchedulerJobs = false;
  showSchedulerJobsPage = false;
  showSchedulerJobsList = false;

  showChartofAccounts = false;
  showChartofAccountsPage = false;
  showChartofAccountsList = false;
  showChartofAccountsForm = false;
  showAccountsLinked = false;
  showAccountsLinkedPage = false;
  showAccountsLinkedList = false;
  showMigrateOpeningBalances = false;
  showClosingEntries = false;
  showClosingEntriesPage = false;
  showClosingEntriesList = false;
  showCreateJournalEntries = false;

  showCharges = false;
  showChargesPage = false;
  showChargesList = false;
  showLoanProducts = false;
  showLoanProductsPage = false;
  showLoanProductsList = false;
  showSavingsProducts = false;
  showSavingsProductsPage = false;
  showSavingsProductsList = false;
  showShareProducts = false;
  showShareProductsPage = false;
  showShareProductsList = false;
  showFixedDepositProducts = false;
  showFixedDepositProductsPage = false;
  showFixedDepositProductsList = false;
  showRecurringDepositProducts = false;
  showRecurringDepositProductsPage = false;
  showRecurringDepositProductsList = false;

  showManageFunds = false;
  showManageReports = false;

  constructor() { }
}
