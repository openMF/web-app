/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { AccountTransfersRoutingModule } from './account-transfers-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { ViewStandingInstructionsComponent } from './view-standing-instructions/view-standing-instructions.component';
import { EditStandingInstructionsComponent } from './edit-standing-instructions/edit-standing-instructions.component';
import { CreateStandingInstructionsComponent } from './create-standing-instructions/create-standing-instructions.component';
import { MakeAccountTransfersComponent } from './make-account-transfers/make-account-transfers.component';
import { ListStandingInstructionsComponent } from './list-standing-instructions/list-standing-instructions.component';
import { ListTransactionsComponent } from './list-transactions/list-transactions.component';
import { ViewAccountTransferComponent } from './view-account-transfer/view-account-transfer.component';
import { MakeAccountInterbankTransfersComponent } from './make-account-interbank-transfers/make-account-interbank-transfers.component';
/**
 * Account Transfers Module
 *
 * All components related to Account Transfers functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    AccountTransfersRoutingModule,
    ViewStandingInstructionsComponent,
    EditStandingInstructionsComponent,
    CreateStandingInstructionsComponent,
    MakeAccountTransfersComponent,
    ListStandingInstructionsComponent,
    ListTransactionsComponent,
    ViewAccountTransferComponent,
    MakeAccountInterbankTransfersComponent
  ],
  providers: []
})
export class AccountTransfersModule {}
