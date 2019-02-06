/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SharesRoutingModule } from './shares-routing.module';

/** Custom Components */
import { SharesComponent } from './shares.component';
import { ViewshareaccountComponent } from './viewshareaccount/viewshareaccount.component';

/**
 * Shares Module
 *
 */
@NgModule({
  imports: [SharedModule, SharesRoutingModule],
  declarations: [
    SharesComponent,
    ViewshareaccountComponent
  ]
})
export class SharesModule {}
