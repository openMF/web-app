import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SystemComponent } from './system.component';

import { SystemRoutingModule } from './system-routing.module';

@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule
  ],
  declarations: [
    SystemComponent
  ]
})
export class SystemModule { }
