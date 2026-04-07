/** Angular Imports */
import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from 'app/reports/reports-routing.module';

/** Custom Components */
import { ReportsComponent } from './reports.component';
import { RunReportComponent } from './run-report/run-report.component';
import { TableAndSmsComponent } from './run-report/table-and-sms/table-and-sms.component';
import { ChartComponent } from './run-report/chart/chart.component';
import { PentahoComponent } from './run-report/pentaho/pentaho.component';

/**
 * Reports Module
 *
 * Reports components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule,
    ReportsComponent,
    RunReportComponent,
    TableAndSmsComponent,
    ChartComponent,
    PentahoComponent
  ],
  providers: [DecimalPipe]
})
export class ReportsModule {}
