import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SystemComponent } from './system.component';

import { SystemRoutingModule } from './system-routing.module';
import { CodesComponent } from './codes/codes.component';

@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule
  ],
  declarations: [
    SystemComponent,
    CodesComponent
  ]
})
export class SystemModule { }
