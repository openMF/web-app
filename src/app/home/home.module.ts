/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

/** Custom Components */
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

/**
 * Home Component
 *
 * Home and dashboard components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    DashboardComponent
  ]
})
export class HomeModule { }
