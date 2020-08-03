/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { NotificationsRoutingModule } from './notifications-routing.module';

/** Custom Components */
import { NotificationsPageComponent } from './notifications-page/notifications-page.component';
import { NotificationsTrayComponent } from './notifications-tray/notifications-tray.component';

/**
 * Notifications Module
 */
@NgModule({
  declarations: [
    NotificationsPageComponent,
    NotificationsTrayComponent
  ],
  imports: [
    SharedModule,
    PipesModule,
    NotificationsRoutingModule
  ],
  exports: [
    NotificationsTrayComponent
  ]
})
export class NotificationsModule { }
