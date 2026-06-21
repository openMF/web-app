/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 2 — Route registry (Angular).
 *
 * Angular uses hash-based routing (/#/login, /#/clients).
 * React uses history-based routing (/login, /clients).
 *
 * Specs never hard-code routes — they consume this registry through
 * page object navigate() calls. Interface signature mirrors the React
 * `AppRoutes` interface so a portability swap is config-only.
 */

export interface AppRoutes {
  login: string;
  home: string;
  clients: string;
  clientCreate: string;
  clientView: (id: number) => string;
  clientPersonalData: (id: number) => string;
  clientAction: (id: number, action: string) => string;
  groups: string;
  groupCreate: string;
  groupView: (id: number) => string;
  users: string;
  userCreate: string;
  userView: (id: number) => string;
}

export const ROUTES: AppRoutes = {
  login: '/#/login',
  home: '/#/home',
  clients: '/#/clients',
  clientCreate: '/#/clients/create',
  clientView: (id) => `/#/clients/${id}/general`,
  clientPersonalData: (id) => `/#/clients/${id}/personal-data`,
  clientAction: (id, action) => `/#/clients/${id}/actions/${encodeURIComponent(action)}`,
  groups: '/#/groups',
  groupCreate: '/#/groups/create',
  groupView: (id) => `/#/groups/${id}/general`,
  users: '/#/appusers',
  userCreate: '/#/appusers/create',
  userView: (id) => `/#/appusers/${id}`
};
