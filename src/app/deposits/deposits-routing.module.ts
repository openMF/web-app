/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { NewFixedDepositComponent } from './fixed/new-fixed-deposit/new-fixed-deposit.component';

/** Custom Resolvers */
import { FixedDepositAccountTemplateResolver } from './fixed/new-fixed-deposit/fixed-deposit-account-template.resolver';

/** Deposits Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'deposit-account',
      data: { title: extract('Deposit Account'), breadcrumb: 'Deposit', addBreadcrumbLink: false },
      children: [
        {
          path: 'fixed',
          data: { title: extract('Fixed Deposit Account'), breadcrumb: 'Fixed', addBreadcrumbLink: false },
          children: [
            {
              path: 'create',
              data: { title: extract('Create Fixed Deposit Account'), breadcrumb: 'Create', addBreadcrumbLink: false },
              children: [
                {
                  path: ':clientId',
                  component: NewFixedDepositComponent,
                  data: {
                    title: extract('Create Client Fixed Deposit Account'),
                    routeParamBreadcrumb: 'clientId'
                  },
                  resolve: {
                    templateData: FixedDepositAccountTemplateResolver
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
];

/**
 * Deposits Routing Module
 *
 * Configures the deposits routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [FixedDepositAccountTemplateResolver]
})
export class DepositsRoutingModule {}
