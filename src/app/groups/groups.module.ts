/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { GroupsRoutingModule } from './groups-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { GroupsComponent } from './groups.component';

/**
 * Groups Module
 *
 * All components related to Groups should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    GroupsRoutingModule,
    PipesModule
  ],
  declarations: [
    GroupsComponent
  ],
  providers: [DatePipe]
})
export class GroupsModule { }
