/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SharesRoutingModule } from './shares-routing.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { SharesComponent } from './shares.component';
import { ViewShareAccountComponent } from './view-share-account/view-share-account.component';

/**
 * Shares Module
 *
 * All components related to shares functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    SharesRoutingModule,
    PipesModule
  ],
  declarations: [
    SharesComponent,
    ViewShareAccountComponent
  ]
})
export class SharesModule {}
