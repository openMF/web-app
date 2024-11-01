/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../../core/route/route.service';

/** Custom Components */
import { ReportingComponent } from './reporting.component';

/** Custom Resolvers */
import { OfficesResolver } from '../../accounting/common-resolvers/offices.resolver';

/** Home and Dashboard Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'reporting',
      redirectTo: '/reporting',
      pathMatch: 'full'
    },
    {
      path: 'reporting',
      component: ReportingComponent,
      data: { title: 'Report' }
    }
  ])
];

/**
 * Home Routing Module
 *
 * Configures the home and dashboard routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OfficesResolver]
})
export class ReportingRoutingModule { }
