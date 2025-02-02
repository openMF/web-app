/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
