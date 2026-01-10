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

// Not Found Component
import { NotFoundComponent } from './not-found/not-found.component';
import { CallbackComponent } from './zitadel/callback/callback.component';

/**
 * Fallback to this route when no prior route is matched.
 */
const routes: Routes = [
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the fallback route.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
