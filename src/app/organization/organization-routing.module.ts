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

/** Custom Resolvers */
import { LoanProvisioningCriteriaResolver } from './loan-provisioning-criteria/loan-provisioning-criteria.resolver';
import { OfficesResolver } from './offices/offices.resolver';

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
          component: OfficesComponent,
          data: { title: extract('Manage Offices'), breadcrumb: 'Manage Offices' },
          resolve: {
            offices: OfficesResolver
          }
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
    OfficesResolver
  ]
})
export class OrganizationRoutingModule { }
