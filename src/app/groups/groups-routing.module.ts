import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { GroupsComponent } from './groups.component';

const routes: Routes = [
  Route.withShell([

    {
      path: 'groups',
      component: GroupsComponent,
      data: { title: extract('Groups') }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class GroupsRoutingModule { }
