/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Modules */
import { LoansRoutingModule } from './loans-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { LoansViewComponent } from './loans-view/loans-view.component';
import { GeneralTabComponent } from './loans-view/general-tab/general-tab.component';
import { AccountDetailsComponent } from './loans-view/account-details/account-details.component';

/**
 * Loans Module
 *
 * All components related to loan functions should be declared here.
 */
@NgModule({
  imports: [SharedModule, LoansRoutingModule, DirectivesModule, PipesModule],
  declarations: [
    AddLoanChargeComponent,
    LoansViewComponent,
    GeneralTabComponent,
    AccountDetailsComponent,
  ],
  providers: [DatePipe],
})
export class LoansModule {}
