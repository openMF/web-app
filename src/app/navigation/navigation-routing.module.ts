/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { NavigationComponent } from './navigation.component';

/** Custom Resolvers */
import { OfficesResolver } from './offices.resolver';

/** Navigation Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'navigation',
      component: NavigationComponent,
      data: { title: 'Navigation', breadcrumb: 'Navigation' },
      resolve: {
        offices: OfficesResolver
      }
    }
  ])

];

/**
 * Navigation Module
 *
 * Configures the navigation (by offices) routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    OfficesResolver
  ]
})
export class NavigationRoutingModule {}
