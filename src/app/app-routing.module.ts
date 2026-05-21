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
 * App routing module.
 *
 * Registers all feature modules as lazy-loaded routes plus the fallback routes.
 */
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginModule)
  },
  {
    path: 'accounting',
    loadChildren: () => import('./accounting/accounting.module').then((m) => m.AccountingModule)
  },
  {
    path: 'centers',
    loadChildren: () => import('./centers/centers.module').then((m) => m.CentersModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./clients/clients.module').then((m) => m.ClientsModule)
  },
  {
    path: 'collections',
    loadChildren: () => import('./collections/collections.module').then((m) => m.CollectionsModule)
  },
  {
    path: 'groups',
    loadChildren: () => import('./groups/groups.module').then((m) => m.GroupsModule)
  },
  {
    path: 'navigation',
    loadChildren: () => import('./navigation/navigation.module').then((m) => m.NavigationModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then((m) => m.NotificationsModule)
  },
  {
    path: 'organization',
    loadChildren: () => import('./organization/organization.module').then((m) => m.OrganizationModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'remittances',
    loadChildren: () => import('./remittances/remittances.module').then((m) => m.RemittancesModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then((m) => m.SearchModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule)
  },
  {
    path: 'system',
    loadChildren: () => import('./system/system.module').then((m) => m.SystemModule)
  },
  {
    path: 'checker-inbox-and-tasks',
    loadChildren: () => import('./tasks/tasks.module').then((m) => m.TasksModule)
  },
  {
    path: 'templates',
    loadChildren: () => import('./templates/templates.module').then((m) => m.TemplatesModule)
  },
  {
    path: 'appusers',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule)
  },
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
 * Configures the top-level routes with lazy loading for all feature modules.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
