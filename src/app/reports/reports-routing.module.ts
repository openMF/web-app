/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ReportsComponent } from './reports.component';

/** Custom Resolvers */
import { ReportsResolver } from './reports.resolver';

/** Reports Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'reports',
      data: { title: extract('Reports'), breadcrumb: 'Reports' },
      children: [
        {
          path: '',
          component: ReportsComponent,
          resolve: {
            reports: ReportsResolver
          },
        },
        {
          path: ':filter',
          component: ReportsComponent,
          data: { title: extract('test'), breadcrumb: 'test' },
          resolve: {
            reports: ReportsResolver
          },
        },
      ]
    }
  ])
];

/**
 * Reports Routing Module
 *
 * Configures the reports routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ReportsResolver,
  ]
})
export class ReportsRoutingModule { }
