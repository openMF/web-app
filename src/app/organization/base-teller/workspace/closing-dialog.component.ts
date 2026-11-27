/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface ClosingDialogData {
  /** Existing translation key of the workflow being opened. */
  workflowLabel: string;
  kind: 'cash-register' | 'end-of-day';
  cashierName: string | null;
  tellerName: string | null;
}

/**
 * Asks the user to confirm before entering a closing workflow.
 *
 * Confirming only authorises navigation. The actual closing command is sent by the destination screen after its own
 * review and confirmation steps, and the end-of-day workflow keeps its supervisor authorisation.
 */
@Component({
  selector: 'mifosx-base-teller-closing-dialog',
  templateUrl: './closing-dialog.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosingDialogComponent {
  readonly data = inject<ClosingDialogData>(MAT_DIALOG_DATA);
}
