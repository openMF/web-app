/** Angular Imports */
import { NgModule } from '@angular/core';

/** Module Imports */
import { SharedModule } from '../shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';

/** Component Imports */
import { CodesComponent } from './codes/codes.component';
import { SystemComponent } from './system.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';
import { ExternalServicesComponent } from './external-services/external-services.component';
import { ManageDataTablesComponent } from './manage-data-tables/manage-data-tables.component';
import { SurveysComponent } from './surveys/surveys.component';
import { ManageHooksComponent } from './manage-hooks/manage-hooks.component';

@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule
  ],
  declarations: [
    SystemComponent,
    CodesComponent,
    CreateCodeComponent,
    ExternalServicesComponent,
    ManageDataTablesComponent,
    SurveysComponent,
    ManageHooksComponent
  ]
})
export class SystemModule { }
