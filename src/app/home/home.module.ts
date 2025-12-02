/** Angular Imports */
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { HomeComponent } from './home.component';
import { AmountCollectedPieComponent } from './amount-collected-pie/amount-collected-pie.component';
import { AmountDisbursedPieComponent } from './amount-disbursed-pie/amount-disbursed-pie.component';
import { ClientTrendsBarComponent } from './client-trends-bar/client-trends-bar.component';
import { TranslateModule } from '@ngx-translate/core';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { SessionTimeoutDialogComponent } from './timeout-dialog/session-timeout-dialog.component';

/**
 * Home Component
 *
 * Home components should be declared here.
 */
@NgModule({
  imports: [
    MatDialogModule,
    SharedModule,
    PipesModule,
    HomeRoutingModule,
    TranslateModule,
    HomeComponent,
    AmountCollectedPieComponent,
    AmountDisbursedPieComponent,
    ClientTrendsBarComponent,
    WarningDialogComponent,
    SessionTimeoutDialogComponent
  ],
  providers: []
})
export class HomeModule {}
