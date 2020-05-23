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
import { NotesTabComponent } from './groups-view/notes-tab/notes-tab.component';
import { CommitteeTabComponent } from './groups-view/committee-tab/committee-tab.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DatatableTabsComponent } from './groups-view/datatable-tabs/datatable-tabs.component';
import { SingleRowComponent } from './groups-view/datatable-tabs/single-row/single-row.component';
import { MultiRowComponent } from './groups-view/datatable-tabs/multi-row/multi-row.component';

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
    GeneralTabComponent,
    NotesTabComponent,
    CommitteeTabComponent,
    CreateGroupComponent,
    DatatableTabsComponent,
    SingleRowComponent,
    MultiRowComponent
  ],
  providers: [DatePipe]
})
export class GroupsModule { }
