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
import { SettingsRoutingModule } from './settings-routing.module';

/** Custom Components */
import { SettingsComponent } from './settings.component';

/**
 * Settings Module
 *
 * All components related to settings and web app configuration should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    SettingsRoutingModule,
    SettingsComponent
  ]
})
export class SettingsModule {}
