import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusLookupPipe } from './status-lookup.pipe';
import { AccountsFilterPipe } from './accounts-filter.pipe';
import { ChargesFilterPipe } from './charges-filter.pipe';
import { ChargesPenaltyFilterPipe } from './charges-penalty-filter.pipe';
import { FindPipe } from './find.pipe';
import { LoanProvisioningAccountFilteringPipe } from './loan-provisioning-account-filtering.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, LoanProvisioningAccountFilteringPipe],
  providers: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, LoanProvisioningAccountFilteringPipe],
  exports: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, LoanProvisioningAccountFilteringPipe]
})
export class PipesModule { }
