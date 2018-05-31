import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ClientsRoutingModule } from './clients-routing.module';
import { CoreModule } from '../core/core.module';
import { ViewClientComponent } from './view-client/view-client.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ClientsRoutingModule,

  ],
  declarations: [
  ClientsComponent,
  CreateClientComponent,
  ViewClientComponent
],
 schemas: [
  CUSTOM_ELEMENTS_SCHEMA
],

})
export class ClientsModule { }
