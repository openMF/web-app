/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/*Custom Directives*/
import { PopoverArrowDirective } from './popover/popover-arrow.directive';
import { PopoverCloseDirective } from './popover/popover-close.directive';

/*Custom Components*/
import { PopoverComponent } from './popover/popover.component';
import { ConfigurationWizardComponent } from './configuration-wizard.component';
import { ContinueSetupDialogComponent } from './continue-setup-dialog/continue-setup-dialog.component';
import { NextStepDialogComponent } from './next-step-dialog/next-step-dialog.component';
import { CompletionDialogComponent } from './completion-dialog/completion-dialog.component';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';

/**
 * Configuration Wizard Module
 */
@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    OverlayModule,
    PortalModule,
    MatDialogModule,
    PopoverComponent,
    PopoverCloseDirective,
    PopoverArrowDirective,
    ConfigurationWizardComponent,
    ContinueSetupDialogComponent,
    NextStepDialogComponent,
    CompletionDialogComponent
  ],
  exports: [
    PopoverCloseDirective
  ]
})
export class ConfigurationWizardModule {}
