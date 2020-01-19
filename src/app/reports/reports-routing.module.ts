/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ReportsComponent } from './reports.component';
import { RunReportComponent } from './run-report/run-report.component';

/** Custom Resolvers */
import { ReportsResolver } from './reports.resolver';
import { RunReportResolver } from './run-report/run-report.resolver';

/** Reports Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'reports',
      data: { title: extract('Reports'), breadcrumb: 'Reports' },
      resolve: {
        reports: ReportsResolver
      },
      children: [
        {
          path: '',
          component: ReportsComponent,
        },
        {
          path: ':filter',
          data: { routeParamBreadcrumb: 'filter' },
          component: ReportsComponent,
        }
      ]
    },
    {
      path: 'run-report',
      data: { title: extract('Reports'), breadcrumb: 'Reports' },
      children: [
        {
          path: '',
          redirectTo: '/reports', pathMatch: 'full'
        },
        {
          path: ':report-name/:report-type/:report-id',
          data: { title: extract('Run Report'), routeParamBreadcrumb: 'report-name' },
          children: [
            {
              path: '',
              component: RunReportComponent,
              resolve: {
                params: RunReportResolver
              }
            }
          ]
        }
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
    RunReportResolver
  ]
})
export class ReportsRoutingModule { }
