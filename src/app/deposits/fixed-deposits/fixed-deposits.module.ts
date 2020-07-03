/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { DirectivesModule } from 'app/directives/directives.module';
import { FixedDepositsRoutingModule } from './fixed-deposits-routing.module';

/** Custom Components */
import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view/fixed-deposit-account-view.component';
import { TransactionsTabComponent } from './fixed-deposit-account-view/transactions-tab/transactions-tab.component';
import { ChargesTabComponent } from './fixed-deposit-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './fixed-deposit-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { InterestRateChartTabComponent } from './fixed-deposit-account-view/interest-rate-chart-tab/interest-rate-chart-tab.component';
import { DatatableTabsComponent } from './fixed-deposit-account-view/datatable-tabs/datatable-tabs.component';
import { MultiRowComponent } from './fixed-deposit-account-view/datatable-tabs/multi-row/multi-row.component';
import { SingleRowComponent } from './fixed-deposit-account-view/datatable-tabs/single-row/single-row.component';
import { FixedDepositsAccountActionsComponent } from './fixed-deposits-account-actions/fixed-deposits-account-actions.component';
import { ApproveFixedDepositsAccountComponent } from './fixed-deposits-account-actions/approve-fixed-deposits-account/approve-fixed-deposits-account.component';
import { RejectFixedDepositsAccountComponent } from './fixed-deposits-account-actions/reject-fixed-deposits-account/reject-fixed-deposits-account.component';

@NgModule({
  declarations: [
    FixedDepositAccountViewComponent,
    TransactionsTabComponent,
    ChargesTabComponent,
    StandingInstructionsTabComponent,
    InterestRateChartTabComponent,
    DatatableTabsComponent,
    MultiRowComponent,
    SingleRowComponent,
    FixedDepositsAccountActionsComponent,
    ApproveFixedDepositsAccountComponent,
    RejectFixedDepositsAccountComponent
  ],
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    FixedDepositsRoutingModule
  ],
  providers: [DatePipe]
})
export class FixedDepositsModule { }
