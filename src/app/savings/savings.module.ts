/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SavingsRoutingModule } from './savings-routing.module';
import { SharedModule } from 'app/shared/shared.module';

/** Custom Components */
import { SavingAccountActionsComponent } from './saving-account-actions/saving-account-actions.component';
import { SavingsAccountTransactionsComponent } from './saving-account-actions/savings-account-transactions/savings-account-transactions.component';

/**
 * Savings Module
 *
 * All components related to Savings functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    SavingsRoutingModule
  ],
  declarations: [
    SavingAccountActionsComponent,
    SavingsAccountTransactionsComponent
  ],
  providers: [DatePipe]
})
export class SavingsModule { }
