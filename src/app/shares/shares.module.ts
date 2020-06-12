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
    ChargesTabComponent
  ],
  providers: [DatePipe]
})
export class SharesModule { }
