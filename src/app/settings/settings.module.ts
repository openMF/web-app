/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

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
    SettingsRoutingModule
  ],
  declarations: [SettingsComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SettingsModule {}
