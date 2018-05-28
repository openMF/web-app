import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsComponent } from './clients.component';
import { ClientsRoutingModule } from './clients-routing.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ClientsRoutingModule,

  ],
  declarations: [
  ClientsComponent
 ],
 schemas: [
  CUSTOM_ELEMENTS_SCHEMA
],

})
export class ClientsModule { }
