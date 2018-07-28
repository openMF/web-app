import { NgModule,  CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';

import { GroupsComponent } from './groups.component';
import { GroupsRoutingModule } from 'app/groups/groups-routing.module';
import { GroupsService } from './groups.service';
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
