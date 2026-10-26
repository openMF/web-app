/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Routes } from '@angular/router';

/** Custom Services */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { LoansComponent } from './loans.component';

/**
 * Routes for the standalone `/loans` mount only.
 *
 * The org-wide loans list renders at the exact path, and every loan detail route
 * is delegated to `LoansModule`. The list is intentionally kept out of
 * `LoansModule` itself, because that module is also lazy-loaded under
 * `clients/:clientId/loans-accounts` and `groups/:groupId/loans-accounts`, where
 * the org-wide list must not appear.
 *
 * `Route.withShell` is applied here (not in `app-routing.module.ts`) to match how
 * every other feature module wraps its own routes; `LoansModule` has no shell of
 * its own since it's normally nested under the already-shelled clients/groups routes.
 *
 * The list has no resolver: the component loads loans progressively so navigation
 * is instant and the first rows appear without waiting for the whole dataset.
 */
export const LOANS_LIST_ROUTES: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: LoansComponent,
      data: { title: 'Loans', breadcrumb: 'Loans', routeParamBreadcrumb: false }
    },
    {
      path: '',
      loadChildren: () => import('./loans.module').then((m) => m.LoansModule)
    }
  ])
];
