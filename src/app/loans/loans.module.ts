/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe} from '@angular/common';

/** Custom Modules */
import { LoansRoutingModule } from './loans-routing.module';
import { SharedModule } from 'app/shared/shared.module';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';

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
  declarations: [AddLoanChargeComponent],
  providers: [DatePipe]

})
export class LoansModule { }
