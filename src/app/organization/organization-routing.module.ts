/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { OrganizationComponent } from './organization.component';
import { LoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/loan-provisioning-criteria.component';
import { OfficesComponent } from './offices/offices.component';
import { EmployeesComponent } from './employees/employees.component';
import { CurrenciesComponent } from './currencies/currencies.component';
import { SmsCampaignsComponent } from './sms-campaigns/sms-campaigns.component';
import { AdhocQueryComponent } from './adhoc-query/adhoc-query.component';
import { TellersComponent } from './tellers/tellers.component';
<<<<<<< HEAD
<<<<<<< HEAD
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { CreateOfficesComponent } from './offices/create-offices/create-offices.component';
=======
>>>>>>> 34e1f4d... feat: add tellers component (#520)
=======
import { PaymentTypesComponent } from './payment-types/payment-types.component';
>>>>>>> dc61cba... feat: add payment types component (#521)

/** Custom Resolvers */
import { LoanProvisioningCriteriaResolver } from './loan-provisioning-criteria/loan-provisioning-criteria.resolver';
import { OfficesResolver } from './offices/offices.resolver';
import { EmployeesResolver } from './employees/employees.resolver';
import { CurrenciesResolver } from './currencies/currencies.resolver';
import { SmsCampaignsResolver } from './sms-campaigns/sms-campaigns.resolver';
import { AdhocQueriesResolver } from './adhoc-query/adhoc-queries.resolver';
import { TellersResolver } from './tellers/tellers.resolver';
<<<<<<< HEAD
<<<<<<< HEAD
import { PaymentTypesResolver } from './payment-types/payment-types.resolver';
=======
>>>>>>> 34e1f4d... feat: add tellers component (#520)
=======
import { PaymentTypesResolver } from './payment-types/payment-types.resolver';
>>>>>>> dc61cba... feat: add payment types component (#521)

/** Organization Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'organization',
      data: { title: extract('Organization'), breadcrumb: 'Organization' },
      children: [
        {
          path: '',
          component: OrganizationComponent
        },
        {
          path: 'provisioning-criteria',
          component: LoanProvisioningCriteriaComponent,
          data: { title: extract('Provisioning Criteria'), breadcrumb: 'Provisioning Criteria' },
          resolve: {
            loanProvisioningCriteria: LoanProvisioningCriteriaResolver
          }
        },
        {
          path: 'offices',
          data: { title: extract('Manage Offices'), breadcrumb: 'Manage Offices' },
          children: [
            {
              path: '',
            component: OfficesComponent,
            resolve: {
              offices: OfficesResolver
            }
          },
            {
              path: 'create-offices',
              component: CreateOfficesComponent,
              data: { title: extract('Create Office'), breadcrumb: 'Create Office' },
              resolve: {
                offices: OfficesResolver,
              }
            }
          ]
        },
        {
          path: 'employees',
          component: EmployeesComponent,
          data: { title: extract('Manage Employees'), breadcrumb: 'Manage Employees' },
          resolve: {
            employees: EmployeesResolver
          }
        },
        {
          path: 'currencies',
          component: CurrenciesComponent,
          data: { title: extract('Currency Configuration'), breadcrumb: 'Currency Configuration' },
          resolve: {
            currencies: CurrenciesResolver
          }
        },
        {
          path: 'sms-campaigns',
          component: SmsCampaignsComponent,
          data: { title: extract('SMS Campaigns'), breadcrumb: 'SMS Campaigns' },
          resolve: {
            smsCampaigns: SmsCampaignsResolver
          }
        },
        {
          path: 'adhoc-query',
          data: { title: extract('Adhoc Query'), breadcrumb: 'Adhoc Query' },
          children: [
            {
              path: '',
              component: AdhocQueryComponent,
              resolve: {
                adhocQueries: AdhocQueriesResolver
              }
            }
          ]
        },
        {
          path: 'tellers',
          component: TellersComponent,
          data: { title: extract('Tellers'), breadcrumb: 'Tellers' },
          resolve: {
            tellers: TellersResolver
          }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dc61cba... feat: add payment types component (#521)
        },
        {
          path: 'payment-types',
          component: PaymentTypesComponent,
          data: { title: extract('Payment Types'), breadcrumb: 'Payment Types' },
          resolve: {
            paymentTypes: PaymentTypesResolver
          }
<<<<<<< HEAD
=======
>>>>>>> 34e1f4d... feat: add tellers component (#520)
=======
>>>>>>> dc61cba... feat: add payment types component (#521)
        }
      ]
    }
  ])
];

/**
 * Organization Routing Module
 *
 * Configures the organization routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LoanProvisioningCriteriaResolver,
    OfficesResolver,
    EmployeesResolver,
    CurrenciesResolver,
    SmsCampaignsResolver,
    AdhocQueriesResolver,
<<<<<<< HEAD
<<<<<<< HEAD
    TellersResolver,
    PaymentTypesResolver
=======
    TellersResolver
>>>>>>> 34e1f4d... feat: add tellers component (#520)
=======
    TellersResolver,
    PaymentTypesResolver
>>>>>>> dc61cba... feat: add payment types component (#521)
  ]
})
export class OrganizationRoutingModule { }
