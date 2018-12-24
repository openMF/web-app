/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';

/** Custom Components */
import { ReportsComponent } from './reports.component';

/**
 * Reports Module
 *
 * All components related to reports functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule
  ],
  declarations: [
    ReportsComponent,
  ]
})
export class ReportsModule { }
