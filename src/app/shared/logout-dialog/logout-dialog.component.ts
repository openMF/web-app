/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Logout confirmation dialog component.
 *
 * Asks the operator to confirm before signing out, so no session state is
 * cleared until the dialog is confirmed. Closes with `true` when the operator
 * confirms and with `false` (or `undefined` on Escape/backdrop dismissal) when
 * the authenticated session must be preserved.
 */
@Component({
  selector: 'mifosx-logout-dialog',
  standalone: true,
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss'],
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
export class LogoutDialogComponent {
  dialogRef = inject<MatDialogRef<LogoutDialogComponent>>(MatDialogRef);
}
