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
import { CloseSharesAccountComponent } from './shares-account-actions/close-shares-account/close-shares-account.component';
import { ActivateSharesAccountComponent } from './shares-account-actions/activate-shares-account/activate-shares-account.component';
import { UndoApprovalSharesAccountComponent } from './shares-account-actions/undo-approval-shares-account/undo-approval-shares-account.component';
import { ApplySharesComponent } from './shares-account-actions/apply-shares/apply-shares.component';
import { RedeemSharesComponent } from './shares-account-actions/redeem-shares/redeem-shares.component';
import { ApproveSharesComponent } from './shares-account-actions/approve-shares/approve-shares.component';
import { ApproveShareDialogComponent } from './shares-account-actions/approve-shares/approve-share-dialog/approve-share-dialog.component';
import { RejectSharesComponent } from './shares-account-actions/reject-shares/reject-shares.component';
import { RejectShareDialogComponent } from './shares-account-actions/reject-shares/reject-share-dialog/reject-share-dialog.component';

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
    RejectSharesAccountComponent,
    CloseSharesAccountComponent,
    ActivateSharesAccountComponent,
    UndoApprovalSharesAccountComponent,
    ApplySharesComponent,
    RedeemSharesComponent,
    ApproveSharesComponent,
    ApproveShareDialogComponent,
    RejectSharesComponent,
    RejectShareDialogComponent
  ],
  providers: [DatePipe]
})
export class SharesModule { }
