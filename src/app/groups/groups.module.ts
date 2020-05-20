/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { GroupsRoutingModule } from './groups-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { GroupsComponent } from './groups.component';
import { GroupsViewComponent } from './groups-view/groups-view.component';
import { GeneralTabComponent } from './groups-view/general-tab/general-tab.component';

/**
 * Groups Module
 *
 * All components related to Groups should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    DirectivesModule,
    GroupsRoutingModule
  ],
  declarations: [
    GroupsComponent,
    GroupsViewComponent,
    GeneralTabComponent
  ],
  providers: [DatePipe]
})
export class GroupsModule { }
