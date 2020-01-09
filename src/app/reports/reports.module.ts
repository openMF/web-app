/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from 'app/reports/reports-routing.module';

/** Custom Components */
import { ReportsComponent } from './reports.component';

/**
 * Reports Module
 *
 * Reports components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule
  ],
  declarations: [ReportsComponent],
})
export class ReportsModule { }
