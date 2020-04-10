/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe} from '@angular/common';

/** Custom Modules */
import { LoansRoutingModule } from './loans-routing.module';
import { SharedModule } from 'app/shared/shared.module';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { MakeRepaymentsComponent } from './view-loan-account/make-repayments/make-repayments.component';
import { ViewLoanAccountComponent } from './view-loan-account/view-loan-account.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';

/**
 * Loans Module
 *
 * All components related to loan functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    LoansRoutingModule
  ],
  declarations: [AddLoanChargeComponent, MakeRepaymentsComponent, ViewLoanAccountComponent],
  providers: [DatePipe],

})
export class LoansModule { }
