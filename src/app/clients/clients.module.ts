/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { ClientsRoutingModule } from './clients-routing.module';
import { SharedModule } from 'app/shared/shared.module';

/** Custom Components */
import { ClientsComponent } from './clients.component';

/**
 * Clients Module
 *
 * All components related to Clients should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ClientsRoutingModule
  ],
  declarations: [ClientsComponent],
  providers: [DatePipe]

})
export class ClientsModule { }
