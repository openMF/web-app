/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { ReportsComponent } from './reports.component';
import { RunReportComponent } from './run-report/run-report.component';

/** Custom Resolvers */
import { ReportsResolver } from './common-resolvers/reports.resolver';
import { RunReportResolver } from './common-resolvers/run-report.resolver';
import { GlAccountsResolver } from '../accounting/common-resolvers/gl-accounts.resolver';
import { GlobalConfigurationsResolver } from 'app/system/configurations/global-configurations-tab/global-configurations.resolver';

/** Reports Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'reports',
      data: { title: 'Reports', breadcrumb: 'Reports' },
      resolve: {
        reports: ReportsResolver
      },
      children: [
        {
          path: '',
          component: ReportsComponent
        },
        {
          path: ':filter',
          data: { routeParamBreadcrumb: 'filter' },
          component: ReportsComponent
        },
        {
          path: 'run/:name',
          data: { title: 'Reports', routeParamBreadcrumb: 'name' },
          component: RunReportComponent,
          resolve: {
            reportParameters: RunReportResolver,
            configurations: GlobalConfigurationsResolver
          }
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
    RunReportResolver,
    GlAccountsResolver
  ]
})
export class ReportsRoutingModule {}
