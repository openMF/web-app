import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { PopoverArrowDirective } from './popover/popover-arrow.directive';
import { PopoverCloseDirective } from './popover/popover-close.directive';
import { PopoverComponent } from './popover/popover.component';
import { ConfigurationWizardComponent } from './configuration-wizard.component';
import { ContinueSetupDialogComponent } from './continue-setup-dialog/continue-setup-dialog.component';
import { NextStepDialogComponent } from './next-step-dialog/next-step-dialog.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    PopoverComponent,
    PopoverCloseDirective,
    PopoverArrowDirective,
    ConfigurationWizardComponent,
    ContinueSetupDialogComponent,
    NextStepDialogComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    OverlayModule,
    PortalModule,
    MatDialogModule
  ],
  exports: [
    PopoverCloseDirective
  ],
  entryComponents: [PopoverComponent, ConfigurationWizardComponent, ContinueSetupDialogComponent, NextStepDialogComponent ]
})
export class ConfigurationWizardModule { }
