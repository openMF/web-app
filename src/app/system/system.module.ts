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
  ]
})
export class SystemModule { }
