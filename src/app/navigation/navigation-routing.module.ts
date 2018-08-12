/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { NavigationComponent } from './navigation.component';

/** Navigation Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'navigation',
      component: NavigationComponent,
      data: { title: extract('Navigation') }
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
  providers: []
})
export class NavigationRoutingModule { }
