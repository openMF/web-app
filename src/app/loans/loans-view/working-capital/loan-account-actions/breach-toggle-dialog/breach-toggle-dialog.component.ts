/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Input of the breach evaluation toggle dialog. */
export interface BreachToggleDialogData {
  /** Action to perform when the user confirms. */
  action: 'disable' | 'enable';
  /** Current business date, the only date the backend accepts. */
  businessDate: Date;
}

/** Result emitted when the user confirms the breach evaluation toggle dialog. */
export interface BreachToggleDialogResult {
  confirm: boolean;
}

/**
 * Confirmation dialog for suspending or resuming breach evaluation.
 *
 * The date is shown but never editable: the backend only accepts the current
 * business date, so offering a picker would only produce rejected requests.
 */
@Component({
  selector: 'mifosx-breach-toggle-dialog',
  templateUrl: './breach-toggle-dialog.component.html',
  styleUrls: ['./breach-toggle-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreachToggleDialogComponent {
  private dialogRef = inject<MatDialogRef<BreachToggleDialogComponent, BreachToggleDialogResult>>(MatDialogRef);
  protected data = inject<BreachToggleDialogData>(MAT_DIALOG_DATA);

  /** True when the dialog suspends evaluation, false when it resumes it. */
  get isDisabling(): boolean {
    return this.data.action === 'disable';
  }

  get businessDate(): Date {
    return this.data.businessDate;
  }

  confirm(): void {
    this.dialogRef.close({ confirm: true });
  }
}
