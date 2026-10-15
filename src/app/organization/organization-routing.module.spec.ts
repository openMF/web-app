/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { RouterModule, ROUTES, Route } from '@angular/router';
import { OrganizationRoutingModule } from './organization-routing.module';
import { CashDrawerPickupComponent } from './base-teller/cash-drawer-pickup/cash-drawer-pickup.component';
import { cashDrawerPickupGuard } from './base-teller/cash-drawer-pickup/cash-drawer-pickup.guard';

describe('Organization pickup routing', () => {
  it('registers the guarded Base Teller pickup screen in the actual organization routes', () => {
    TestBed.configureTestingModule({ imports: [
        RouterModule.forRoot([]),
        OrganizationRoutingModule
      ] });
    function flatten(routes: Route[]): Route[] {
      return routes.flatMap((route) => [
        route,
        ...flatten(route.children ?? [])
      ]);
    }
    const routes = flatten(TestBed.inject(ROUTES).flat());
    const pickup = routes.find((route) => route.path === 'base-teller/cash-drawer-pickup');
    expect(pickup?.component).toBe(CashDrawerPickupComponent);
    expect(pickup?.canActivate).toContain(cashDrawerPickupGuard);
    expect(pickup?.data).toEqual({ title: 'cashPickup.title', breadcrumb: 'cashPickup.title' });
  });
});
