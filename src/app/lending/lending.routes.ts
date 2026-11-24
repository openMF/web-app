/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Routes } from '@angular/router';

/** The lending module's screens (fineract-dbug ADR-0061, docs/lending.md), lazy-loaded under /lending. */
export const LENDING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'valuers' },
  {
    path: 'valuers',
    loadComponent: () => import('./valuers/valuers-list/valuers-list.component').then((m) => m.ValuersListComponent),
    // Kept with the cooperative's other lists under Admin › Organization.
    data: {
      title: 'Valuers',
      breadcrumb: 'Valuers',
      parentBreadcrumb: { label: 'Organization', url: '/organization' }
    }
  }
];
