/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Route as ngRoute, Routes } from '@angular/router';

/** Custom Components */
import { ShellComponent } from '../shell/shell.component';

/** Custom Guards */
import { AuthenticationGuard } from '../authentication/authentication.guard';

/**
 * Provides helper methods to create routes.
 */
export class Route {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return {Route} The new route using shell as the base.
   */
  static withShell(routes: Routes): ngRoute {
    return {
      path: '',
      component: ShellComponent,
      children: routes,
      canActivate: [AuthenticationGuard]
      // Reuse ShellComponent instance when navigating between child views
      // data: { reuse: true }
    };
  }
}
