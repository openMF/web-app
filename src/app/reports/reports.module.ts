/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
