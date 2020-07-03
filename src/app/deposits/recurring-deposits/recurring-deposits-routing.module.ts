/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../../core/i18n/i18n.service';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';
import { InterestRateChartTabComponent } from './recurring-deposits-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';

/** Custom Resolvers */
import { RecurringDepositsAccountViewResolver } from './common-resolvers/recurring-deposits-account-view.resolver';
import { RecurringDepositsAccountDataResolver } from './common-resolvers/recurring-deposits-account-data.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All RecurringDeposits'), breadcrumb: 'RecurringDeposits', routeParamBreadcrumb: false },
    children: [
      {
        path: ':recurringDepositAccountId',
        data: { title: extract('RecurringDeposit Account View'), routeParamBreadcrumb: 'recurringDepositAccountId' },
        component: RecurringDepositsAccountViewComponent,
        resolve: {
          recurringDepositsAccountData: RecurringDepositsAccountViewResolver
        },
        children: [
          {
            path: 'interest-rate-chart',
            component: InterestRateChartTabComponent,
            data: { title: extract('Interest Rate Chart'), breadcrumb: 'Interest Rate Chart', routeParamBreadcrumb: false },
            resolve: {
              recurringDepositsAccountData: RecurringDepositsAccountDataResolver
            }
          }
        ]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    RecurringDepositsAccountViewResolver,
    RecurringDepositsAccountDataResolver
  ]
})
export class RecurringDepositsRoutingModule {}
