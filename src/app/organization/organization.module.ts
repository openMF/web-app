/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { PipesModule } from 'app/pipes/pipes.module';

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
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { PasswordPreferencesComponent } from './password-preferences/password-preferences.component';
import { EntityDataTableChecksComponent } from './entity-data-table-checks/entity-data-table-checks.component';
import { WorkingDaysComponent } from './working-days/working-days.component';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { CreatePaymentTypeComponent } from './payment-types/create-payment-type/create-payment-type.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';

/**
 * Organization Module
 *
 * Organization components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    OrganizationRoutingModule,
    PipesModule
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
    PaymentTypesComponent,
    PasswordPreferencesComponent,
    EntityDataTableChecksComponent,
    WorkingDaysComponent,
    CreateOfficeComponent,
    CreateEmployeeComponent,
    CreatePaymentTypeComponent,
    ViewEmployeeComponent
  ]
})
export class OrganizationModule { }
