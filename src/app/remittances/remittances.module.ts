/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from 'app/pipes/pipes.module';
import { DirectivesModule } from 'app/directives/directives.module';

import { RemittancesRoutingModule } from './remittances-routing.module';
import { ProcessRemittanceComponent } from './process-remittance/process-remittance.component';
import { SearchRemittanceStepComponent } from './remittance-stepper/search-remittance-step/search-remittance-step.component';
import { RemittanceDetailsStepComponent } from './remittance-stepper/remittance-details-step/remittance-details-step.component';
import { SearchBeneficiaryStepComponent } from './remittance-stepper/search-beneficiary-step/search-beneficiary-step.component';
import { BeneficiaryDetailsStepComponent } from './remittance-stepper/beneficiary-details-step/beneficiary-details-step.component';
import { TransactionalProfileStepComponent } from './remittance-stepper/transactional-profile-step/transactional-profile-step.component';
import { ConfirmPaymentStepComponent } from './remittance-stepper/confirm-payment-step/confirm-payment-step.component';
import { PaymentReceiptStepComponent } from './remittance-stepper/payment-receipt-step/payment-receipt-step.component';

@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    RemittancesRoutingModule,
    ProcessRemittanceComponent,
    SearchRemittanceStepComponent,
    RemittanceDetailsStepComponent,
    SearchBeneficiaryStepComponent,
    BeneficiaryDetailsStepComponent,
    TransactionalProfileStepComponent,
    ConfirmPaymentStepComponent,
    PaymentReceiptStepComponent
  ],
  providers: []
})
export class RemittancesModule {}
