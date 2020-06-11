/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SavingsRoutingModule } from './savings-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { SavingAccountActionsComponent } from './saving-account-actions/saving-account-actions.component';
import { SavingsAccountTransactionsComponent } from './saving-account-actions/savings-account-transactions/savings-account-transactions.component';
import { AddSavingsChargeComponent } from './add-savings-charge/add-savings-charge.component';
import { TransactionsTabComponent } from './savings-account-view/transactions-tab/transactions-tab.component';
import { SavingsAccountViewComponent } from './savings-account-view/savings-account-view.component';
import { ChargesTabComponent } from './savings-account-view/charges-tab/charges-tab.component';
import { StandingInstructionsTabComponent } from './savings-account-view/standing-instructions-tab/standing-instructions-tab.component';
import { DatatableTabsComponent } from './savings-account-view/datatable-tabs/datatable-tabs.component';
import { MultiRowComponent } from './savings-account-view/datatable-tabs/multi-row/multi-row.component';
import { SingleRowComponent } from './savings-account-view/datatable-tabs/single-row/single-row.component';

/**
 * Savings Module
 *
 * All components related to Savings functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    SavingsRoutingModule
  ],
  declarations: [
    SavingAccountActionsComponent,
    SavingsAccountTransactionsComponent,
    AddSavingsChargeComponent,
    TransactionsTabComponent,
    SavingsAccountViewComponent,
    ChargesTabComponent,
    StandingInstructionsTabComponent,
    DatatableTabsComponent,
    MultiRowComponent,
    SingleRowComponent
  ],
  providers: [DatePipe]
})
export class SavingsModule {}
