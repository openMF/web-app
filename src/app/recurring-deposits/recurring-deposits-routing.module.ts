/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';

/** Custom Resolvers */
import { RecurringDepositsAccountViewResolver } from './common-resolvers/recurring-deposits-account-view.resolver';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('All RecurringDeposits'), breadcrumb: 'RecurringDeposits', routeParamBreadcrumb: false },
    children: [
      {
        path: ':recurringDepositAccountId',
        data: { title: extract('RecurringDeposit Account View'), routeParamBreadcrumb: 'recurringDepositAccountId' },
        resolve: {
          recurringDepositsAccountData: RecurringDepositsAccountViewResolver
        },
        component: RecurringDepositsAccountViewComponent
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
  ]
})
export class RecurringDepositsRoutingModule {}
