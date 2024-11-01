/** Angular Imports */
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/** Custom Modules */
import { SharedModule } from '../../shared/shared.module';
import { ReportingRoutingModule } from './reporting-routing.module';
import { PipesModule } from '../../pipes/pipes.module';

/** Custom Components */
import { ReportingComponent } from './reporting.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Home Component
 *
 * Home and dashboard components should be declared here.
 */
@NgModule({
  imports: [
    MatDialogModule,
    SharedModule,
    PipesModule,
    ReportingRoutingModule,
    TranslateModule,
  ],
  declarations: [
    ReportingComponent
  ],
  providers: [ ]
})
export class ReportingModule { }
