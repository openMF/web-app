/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';

/** Custom Resolvers */
import {LoanChargeTemplateResolver} from './common-resolvers/loan-charge-template.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: ':clientType',
      data: { title: extract('Clients'), routeParamBreadcrumb: 'clientType' },
      children: [
        {
          path: 'view',
          children: [
            {
              path: ':clientId',
              data: { title: extract('Client View'), routeParamBreadcrumb: 'clientId' },
              children: [
                {
                  path: 'loans',
                  data: { title: extract('All Loans'), breadcrumb: 'Loans', routeParamBreadcrumb: false },
                  children: [
                    {
                      path: ':loanId',
                      data: { title: extract('Loan View'), routeParamBreadcrumb: 'loanId' },
                      // Component For Loan View Comes Here
                      children: [
                        {
                          path: 'add-loan-charge',
                          component: AddLoanChargeComponent,
                          data: {title: extract('Add Loan Charge'), breadcrumb: 'Add Loan Charge', routeParamBreadcrumb: false},
                          resolve: {
                            loanChargeTemplate: LoanChargeTemplateResolver
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ])
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [LoanChargeTemplateResolver]
})
export class LoansRoutingModule {}
