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
import { NotificationsPageComponent } from './notifications-page/notifications-page.component';

/** Custom Resolvers */
import { NotificationsResolver } from './notifications.resolver';

/** Notification Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'notifications',
      component: NotificationsPageComponent,
      data: { title: 'Notifications', breadcrumb: 'Notifications' },
      resolve: {
        notifications: NotificationsResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [NotificationsResolver],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
