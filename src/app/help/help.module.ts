/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { HelpRoutingModule } from './help-routing.module';

/** Custom Components */
import { KeyboardShortcutsComponent } from './keyboard-shortcuts/keyboard-shortcuts.component';
import { HelpComponent } from './help.component';

/**
 * Help Module
 *
 * All components related to help should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    HelpRoutingModule
  ],
  declarations: [
    KeyboardShortcutsComponent,
    HelpComponent
  ]
})
export class HelpModule { }
