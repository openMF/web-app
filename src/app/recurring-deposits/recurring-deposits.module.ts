/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { RecurringDepositsRoutingModule } from './recurring-deposits-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view/recurring-deposits-account-view.component';

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
    RecurringDepositsAccountViewComponent
  ],
  providers: [DatePipe]
})
export class RecurringDepositsModule {}
