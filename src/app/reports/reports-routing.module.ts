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
import { XBRLComponent } from './xbrl/xbrl.component';
import { XBRLReportComponent } from './xbrl-report/xbrl-report.component';

/** Custom Resolvers */
import { ReportsResolver } from './common-resolvers/reports.resolver';
import { RunReportResolver } from './common-resolvers/run-report.resolver';
import { MixTaxonomyResolver } from './common-resolvers/mixtaxonomy.resolver';
import { MixMappingsResolver } from './common-resolvers/mixmappings.resolver';
import { GlAccountsResolver } from '../accounting/common-resolvers/gl-accounts.resolver';

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
          component: ReportsComponent
        },
        {
          path: ':filter',
          data: { routeParamBreadcrumb: 'filter' },
          component: ReportsComponent
        },
        {
          path: 'run/:name',
          data: { title: extract('Reports'), routeParamBreadcrumb: 'name' },
          component: RunReportComponent,
          resolve: {
            reportParameters: RunReportResolver
          }
        }
      ]
    },
    {
      path: 'xbrl',
      data: { title: extract('XBRL'), breadcrumb: 'XBRL' },
      children: [
        {
          path: '',
          component: XBRLComponent,
          resolve: {
            mixtaxonomy: MixTaxonomyResolver,
            mixmapping: MixMappingsResolver,
            glAccounts: GlAccountsResolver
          }
        },
        {
          path: 'report',
          data: { title: extract('XBRL Report'), breadcrumb: 'Run Report' },
          component: XBRLReportComponent
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
    MixTaxonomyResolver,
    MixMappingsResolver,
    GlAccountsResolver
  ]
})
export class ReportsRoutingModule { }
