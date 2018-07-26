import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsComponent } from './groups.component';
import { GroupsRoutingModule } from 'app/groups/groups-routing.module';

@NgModule({
  imports: [
    CommonModule,
    GroupsRoutingModule
  ],
  declarations: [GroupsComponent]
})
export class GroupsModule { }
