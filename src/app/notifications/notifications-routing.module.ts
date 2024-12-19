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
