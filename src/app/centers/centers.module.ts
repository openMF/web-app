/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { CentersRoutingModule } from './centers-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';
import { CentersViewComponent } from './centers-view/centers-view.component';
import { GeneralTabComponent } from './centers-view/general-tab/general-tab.component';
import { NotesTabComponent } from './centers-view/notes-tab/notes-tab.component';
import { DatatableTabComponent } from './centers-view/datatable-tab/datatable-tab.component';
import { MultiRowComponent } from './centers-view/datatable-tab/multi-row/multi-row.component';
import { SingleRowComponent } from './centers-view/datatable-tab/single-row/single-row.component';

/**
 * Centers Module
 *
 * All components related to Centers should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    CentersRoutingModule,
    PipesModule,
    DirectivesModule
  ],
  declarations: [
    CentersComponent,
    CreateCenterComponent,
    CentersViewComponent,
    GeneralTabComponent,
    NotesTabComponent,
    DatatableTabComponent,
    MultiRowComponent,
    SingleRowComponent
  ]
})
export class CentersModule { }
