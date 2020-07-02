/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from 'app/core/i18n/i18n.service';

/** Custom Components */
import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view/fixed-deposit-account-view.component';
import { InterestRateChartTabComponent } from './fixed-deposit-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { TransactionsTabComponent } from './fixed-deposit-account-view/transactions-tab/transactions-tab.component';
import { ChargesTabComponent } from './fixed-deposit-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './fixed-deposit-account-view/standing-instructions-tab/standing-instructions-tab.component';

/** Custom Resolvers */
import { FixedDepositsAccountViewResolver } from '../fixed-deposits/common-resolvers/fixed-deposit-account-view.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All Fixed Deposits'), breadcrumb: 'Fixed Deposits', routeParamBreadcrumb: false },
    children: [
      {
        path: ':fixedDepositAccountId',
        data: { title: extract('Fixed Deposit Account View'), routeParamBreadcrumb: 'fixedDepositAccountId' },
        resolve: {

        },
        children: [
          {
            path: '',
            component: FixedDepositAccountViewComponent,
            resolve: {
              fixedDepositsAccountData: FixedDepositsAccountViewResolver
            },
            children: [
              {
                path: 'interest-rate-chart',
                component: InterestRateChartTabComponent,
                data: { title: extract('Fixed Deposit Account Interest Rate Chart'), breadcrumb: 'Interest Rate Chart', routeParamBreadcrumb: false },
              },
              {
                path: 'transactions',
                component: TransactionsTabComponent,
                data: { title: extract('Fixed Deposit Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
              },
              {
                path: 'charges',
                component: ChargesTabComponent,
                data: { title: extract('Fixed Deposit Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false }
              },
              {
                path: 'standing-instructions',
                component: StandingInstructionsTabComponent,
                data: { title: extract('Fixed Deposit Account Standing Instructions'), breadcrumb: 'Standing Instructions', routeParamBreadcrumb: false }
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    FixedDepositsAccountViewResolver
  ]
})
export class FixedDepositsRoutingModule { }
