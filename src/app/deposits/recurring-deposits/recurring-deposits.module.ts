/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { RecurringDepositsRoutingModule } from './recurring-deposits-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from '../../directives/directives.module';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';
import { InterestRateChartTabComponent } from './recurring-deposits-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { TransactionsTabComponent } from './recurring-deposits-account-view/transactions-tab/transactions-tab.component';
import { StandingInstructionsTabComponent } from './recurring-deposits-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { ChargesTabComponent } from './recurring-deposits-account-view/charges-tab/charges-tab.component';
import { DatatableTabsComponent } from './recurring-deposits-account-view/datatable-tabs/datatable-tabs.component';
import { MultiRowComponent } from './recurring-deposits-account-view/datatable-tabs/multi-row/multi-row.component';
import { SingleRowComponent } from './recurring-deposits-account-view/datatable-tabs/single-row/single-row.component';

/**
 * RecurringDeposits Module
 *
 * All components related to RecurringDeposits functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    RecurringDepositsRoutingModule
  ],
  declarations: [
    RecurringDepositsAccountViewComponent,
    InterestRateChartTabComponent,
    TransactionsTabComponent,
    StandingInstructionsTabComponent,
    ChargesTabComponent,
    DatatableTabsComponent,
    MultiRowComponent,
    SingleRowComponent
  ],
  providers: [DatePipe]
})
export class RecurringDepositsModule {}
