/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharesRoutingModule } from './shares-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';
import { SharesAccountViewComponent } from './shares-account-view/shares-account-view.component';
import { TransactionsTabComponent } from './shares-account-view/transactions-tab/transactions-tab.component';
import { DividendsTabComponent } from './shares-account-view/dividends-tab/dividends-tab.component';
import { ChargesTabComponent } from './shares-account-view/charges-tab/charges-tab.component';
import { CreateSharesAccountComponent } from './create-shares-account/create-shares-account.component';
import { SharesAccountDetailsStepComponent } from './shares-account-stepper/shares-account-details-step/shares-account-details-step.component';
import { SharesAccountTermsStepComponent } from './shares-account-stepper/shares-account-terms-step/shares-account-terms-step.component';
import { SharesAccountChargesStepComponent } from './shares-account-stepper/shares-account-charges-step/shares-account-charges-step.component';
import { SharesAccountPreviewStepComponent } from './shares-account-stepper/shares-account-preview-step/shares-account-preview-step.component';
import { EditSharesAccountComponent } from './edit-shares-account/edit-shares-account.component';
import { SharesAccountActionsComponent } from './shares-account-actions/shares-account-actions.component';
import { ApproveSharesAccountComponent } from './shares-account-actions/approve-shares-account/approve-shares-account.component';
import { RejectSharesAccountComponent } from './shares-account-actions/reject-shares-account/reject-shares-account.component';

/**
 * Shares Module
 *
 * All components related to Shares functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    SharesRoutingModule
  ],
  declarations: [
    SharesAccountViewComponent,
    TransactionsTabComponent,
    DividendsTabComponent,
    ChargesTabComponent,
    CreateSharesAccountComponent,
    SharesAccountDetailsStepComponent,
    SharesAccountTermsStepComponent,
    SharesAccountChargesStepComponent,
    SharesAccountPreviewStepComponent,
    EditSharesAccountComponent,
    SharesAccountActionsComponent,
    ApproveSharesAccountComponent,
    RejectSharesAccountComponent
  ],
  providers: [DatePipe]
})
export class SharesModule { }
