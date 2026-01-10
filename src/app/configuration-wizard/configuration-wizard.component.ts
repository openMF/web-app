/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
  MatDialogActions
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatProgressBar } from '@angular/material/progress-bar';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Configuration Wizard Component.
 */
@Component({
  selector: 'mifosx-configuration-wizard',
  templateUrl: './configuration-wizard.component.html',
  styleUrls: ['./configuration-wizard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogClose,
    MatProgressBar,
    MatDialogActions
  ]
})
export class ConfigurationWizardComponent {
  dialogRef = inject<MatDialogRef<ConfigurationWizardComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  show: number;
}
