/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { DirectivesModule } from 'app/directives/directives.module';

/** Custom Components */
import { OrganizationComponent } from './organization.component';
import { LoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/loan-provisioning-criteria.component';
import { OfficesComponent } from './offices/offices.component';
import { EmployeesComponent } from './employees/employees.component';
import { CurrenciesComponent } from './currencies/currencies.component';
import { SmsCampaignsComponent } from './sms-campaigns/sms-campaigns.component';
import { AdhocQueryComponent } from './adhoc-query/adhoc-query.component';
import { ViewAdhocQueryComponent } from './adhoc-query/view-adhoc-query/view-adhoc-query.component';
import { TellersComponent } from './tellers/tellers.component';
import { ViewTellerComponent } from './tellers/view-teller/view-teller.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { EditPaymentTypeComponent } from './payment-types/edit-payment-type/edit-payment-type.component';
import { PasswordPreferencesComponent } from './password-preferences/password-preferences.component';
import { EntityDataTableChecksComponent } from './entity-data-table-checks/entity-data-table-checks.component';
import { WorkingDaysComponent } from './working-days/working-days.component';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { CreatePaymentTypeComponent } from './payment-types/create-payment-type/create-payment-type.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';
import { EditOfficeComponent } from './offices/edit-office/edit-office.component';
import { CreateAdhocQueryComponent } from './adhoc-query/create-adhoc-query/create-adhoc-query.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { CreateTellerComponent } from './tellers/create-teller/create-teller.component';
import { EditTellerComponent } from './tellers/edit-teller/edit-teller.component';
import { ViewLoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/view-loan-provisioning-criteria/view-loan-provisioning-criteria.component';
import { ViewCashierComponent } from './tellers/view-cashier/view-cashier.component';
import { ViewHolidaysComponent } from './holidays/view-holidays/view-holidays.component';
import { ViewOfficeComponent } from './offices/view-office/view-office.component';
import { GeneralTabComponent } from './offices/view-office/general-tab/general-tab.component';
import { DatatableTabsComponent } from './offices/view-office/datatable-tabs/datatable-tabs.component';
import { SingleRowComponent } from './offices/view-office/datatable-tabs/single-row/single-row.component';
import { MultiRowComponent } from './offices/view-office/datatable-tabs/multi-row/multi-row.component';
import { ViewCampaignComponent } from './sms-campaigns/view-campaign/view-campaign.component';
import { ManageFundsComponent } from './manage-funds/manage-funds.component';
import { ManageCurrenciesComponent } from './currencies/manage-currencies/manage-currencies.component';
import { CashiersComponent } from './tellers/cashiers/cashiers.component';

/**
 * Organization Module
 *
 * Organization components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    OrganizationRoutingModule
  ],
  declarations: [
    OrganizationComponent,
    LoanProvisioningCriteriaComponent,
    OfficesComponent,
    EmployeesComponent,
    CurrenciesComponent,
    SmsCampaignsComponent,
    AdhocQueryComponent,
    ViewAdhocQueryComponent,
    TellersComponent,
    ViewTellerComponent,
    PaymentTypesComponent,
    EditPaymentTypeComponent,
    PasswordPreferencesComponent,
    EntityDataTableChecksComponent,
    WorkingDaysComponent,
    CreateOfficeComponent,
    CreateEmployeeComponent,
    CreatePaymentTypeComponent,
    ViewEmployeeComponent,
    CreateAdhocQueryComponent,
    HolidaysComponent,
    EditOfficeComponent,
    EditEmployeeComponent,
    CreateTellerComponent,
    EditTellerComponent,
    ViewLoanProvisioningCriteriaComponent,
    ViewCashierComponent,
    ViewHolidaysComponent,
    ViewOfficeComponent,
    GeneralTabComponent,
    DatatableTabsComponent,
    SingleRowComponent,
    MultiRowComponent,
    ViewCampaignComponent,
    ManageFundsComponent,
    ManageCurrenciesComponent,
    CashiersComponent
  ]
})
export class OrganizationModule { }
