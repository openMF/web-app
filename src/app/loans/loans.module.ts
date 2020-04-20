/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { LoansRoutingModule } from './loans-routing.module';
import { PipesModule } from 'app/pipes/pipes.module';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { CreateLoanAccountComponent } from './create-loan-account/create-loan-account.component';
import { EditLoanAccountComponent } from './edit-loan-account/edit-loan-account.component';
import { LoanAccountDetailsStepComponent } from './loan-account-stepper/loan-account-details-step/loan-account-details-step.component';
import { LoanAccountChargesStepComponent } from './loan-account-stepper/loan-account-charges-step/loan-account-charges-step.component';
import { LoanAccountPreviewStepComponent } from './loan-account-stepper/loan-account-preview-step/loan-account-preview-step.component';
import { LoanAccountTermsStepComponent } from './loan-account-stepper/loan-account-terms-step/loan-account-terms-step.component';

/**
 * Loans Module
 *
 * All components related to loan functions should be declared here.
 */
@NgModule({
  imports: [SharedModule, LoansRoutingModule, PipesModule],
  declarations: [
    AddLoanChargeComponent,
    CreateLoanAccountComponent,
    EditLoanAccountComponent,
    LoanAccountPreviewStepComponent,
    LoanAccountTermsStepComponent,
    LoanAccountChargesStepComponent,
    LoanAccountDetailsStepComponent
  ],
  providers: [DatePipe]
})
export class LoansModule {}
