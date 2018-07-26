import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { CentersComponent } from './centers.component';

const routes: Routes = [
  Route.withShell([

    {
      path: 'centers',
      component: CentersComponent,
      data: { title: extract('Centers'),  breadcrumb: 'Centers' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CentersRoutingModule { }
