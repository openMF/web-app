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
import { CreateRecurringDepositsAccountComponent } from './create-recurring-deposits-account/create-recurring-deposits-account.component';
import { RecurringDepositsAccountDetailsStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-details-step/recurring-deposits-account-details-step.component';
import { RecurringDepositsAccountTermsStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-terms-step/recurring-deposits-account-terms-step.component';
import { RecurringDepositsAccountCurrencyStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-currency-step/recurring-deposits-account-currency-step.component';
import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-settings-step/recurring-deposits-account-settings-step.component';
import { RecurringDepositsAccountInterestRateChartStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-interest-rate-chart-step/recurring-deposits-account-interest-rate-chart-step.component';
import { RecurringDepositsAccountChargesStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-charges-step/recurring-deposits-account-charges-step.component';
import { RecurringDepositsAccountPreviewStepComponent } from './recurring-deposits-account-stepper/recurring-deposits-account-preview-step/recurring-deposits-account-preview-step.component';
import { RecurringDepositsAccountActionsComponent } from './recurring-deposits-account-actions/recurring-deposits-account-actions.component';
import { ActivateRecurringDepositsAccountComponent } from './recurring-deposits-account-actions/activate-recurring-deposits-account/activate-recurring-deposits-account.component';
import { UndoApprovalRecurringDepositsAccountComponent } from './recurring-deposits-account-actions/undo-approval-recurring-deposits-account/undo-approval-recurring-deposits-account.component';
import { ApproveRecurringDepositsAccountComponent } from './recurring-deposits-account-actions/approve-recurring-deposits-account/approve-recurring-deposits-account.component';
import { RejectRecurringDepositsAccountComponent } from './recurring-deposits-account-actions/reject-recurring-deposits-account/reject-recurring-deposits-account.component';
import { WithdrawByClientRecurringDepositsAccountComponent } from './recurring-deposits-account-actions/withdraw-by-client-recurring-deposits-account/withdraw-by-client-recurring-deposits-account.component';

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
    SingleRowComponent,
    CreateRecurringDepositsAccountComponent,
    RecurringDepositsAccountDetailsStepComponent,
    RecurringDepositsAccountTermsStepComponent,
    RecurringDepositsAccountCurrencyStepComponent,
    RecurringDepositsAccountSettingsStepComponent,
    RecurringDepositsAccountInterestRateChartStepComponent,
    RecurringDepositsAccountChargesStepComponent,
    RecurringDepositsAccountPreviewStepComponent,
    RecurringDepositsAccountActionsComponent,
    ActivateRecurringDepositsAccountComponent,
    UndoApprovalRecurringDepositsAccountComponent,
    ApproveRecurringDepositsAccountComponent,
    RejectRecurringDepositsAccountComponent,
    WithdrawByClientRecurringDepositsAccountComponent
  ],
  providers: [DatePipe]
})
export class RecurringDepositsModule {}
