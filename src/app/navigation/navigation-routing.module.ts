/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
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
  providers: [
    OfficesResolver
  ]
})
export class NavigationRoutingModule {}
