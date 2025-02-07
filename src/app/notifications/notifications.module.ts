/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { NotificationsRoutingModule } from './notifications-routing.module';

/** Custom Components */
import { NotificationsPageComponent } from './notifications-page/notifications-page.component';

/**
 * Notifications Module
 */
@NgModule({
  declarations: [
    NotificationsPageComponent
  ],
  imports: [
    SharedModule,
    PipesModule,
    NotificationsRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class NotificationsModule {}
