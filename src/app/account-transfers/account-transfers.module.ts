/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { AccountTransfersRoutingModule } from './account-transfers-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { ViewStandingInstructionsComponent } from './view-standing-instructions/view-standing-instructions.component';
import { EditStandingInstructionsComponent } from './edit-standing-instructions/edit-standing-instructions.component';
import { CreateStandingInstructionsComponent } from './create-standing-instructions/create-standing-instructions.component';

/**
 * Account Transfers Module
 *
 * All components related to Account Transfers functions should be declared here.
 */
@NgModule({
  imports: [SharedModule, PipesModule, DirectivesModule, AccountTransfersRoutingModule],
  declarations: [
    ViewStandingInstructionsComponent,
    EditStandingInstructionsComponent,
    CreateStandingInstructionsComponent
  ],
  providers: [DatePipe]
})
export class AccountTransfersModule { }
