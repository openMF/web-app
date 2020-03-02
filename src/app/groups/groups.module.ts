/** Angular Imports */
import { NgModule,  CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';

/** Custom Modules */
import { GroupsRoutingModule } from 'app/groups/groups-routing.module';

/** Custom Components */
import { GroupsComponent } from './groups.component';

/** Custom Services */
import { GroupsService } from './groups.service';

/**
 * Groups Module
 *
 * All components related to Groups should be declared here.
 */
@NgModule({
  imports: [
    CommonModule,
    GroupsRoutingModule,
    CoreModule,
    MatTableModule,
    FlexLayoutModule
  ],
  declarations: [GroupsComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class GroupsModule { }
