import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

import { ReportsComponent } from './reports/reports.component'

const routes: Routes = [
  Route.withShell([

    {
      path: 'reports',
      component: ReportsComponent,
      data: { title: extract('Reports'), breadcrumb: 'reports' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ReportsRoutingModule { }
