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
import { TellersComponent } from './tellers/tellers.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { PasswordPreferencesComponent } from './password-preferences/password-preferences.component';
import { EntityDataTableChecksComponent } from './entity-data-table-checks/entity-data-table-checks.component';

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
    TellersComponent,
    PaymentTypesComponent,
    PasswordPreferencesComponent,
    EntityDataTableChecksComponent
  ]
})
export class OrganizationModule { }
