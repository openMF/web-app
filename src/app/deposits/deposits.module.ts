/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { DepositsRoutingModule } from './deposits-routing.module';

/** Custom Components */
import { NewFixedDepositComponent } from './fixed/new-fixed-deposit/new-fixed-deposit.component';
import { ShowIncentivesDialogComponent } from './show-incentives-dialog/show-incentives-dialog.component';
import { EditChargeDialogComponent } from './edit-charge-dialog/edit-charge-dialog.component';

/**
 * Deposits Module
 *
 * Deposits components should be declared here.
 */
@NgModule({
  declarations: [NewFixedDepositComponent, ShowIncentivesDialogComponent, EditChargeDialogComponent],
  imports: [SharedModule, DepositsRoutingModule],
  entryComponents: [ShowIncentivesDialogComponent, EditChargeDialogComponent]
})
export class DepositsModule {}
