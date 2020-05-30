/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AmountCollectedPieComponent } from './dashboard/amount-collected-pie/amount-collected-pie.component';
import { AmountDisbursedPieComponent } from './dashboard/amount-disbursed-pie/amount-disbursed-pie.component';
import { ClientTrendsBarComponent } from './dashboard/client-trends-bar/client-trends-bar.component';

/**
 * Home Component
 *
 * Home and dashboard components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    DashboardComponent,
    AmountCollectedPieComponent,
    AmountDisbursedPieComponent,
    ClientTrendsBarComponent
  ],
  providers: [
    DatePipe
  ]
})
export class HomeModule { }
