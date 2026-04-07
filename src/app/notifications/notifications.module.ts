/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

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
  imports: [
    SharedModule,
    PipesModule,
    NotificationsRoutingModule,
    NotificationsPageComponent
  ]
})
export class NotificationsModule {}
