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
import { SettingsComponent } from './settings.component';

/** Settings Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'settings',
      component: SettingsComponent,
      data: { title: 'Settings', breadcrumb: 'Settings' }
    }
  ])
];

/**
 * Settings Routing Module
 *
 * Configures the settings and web app configuration routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SettingsRoutingModule {}
