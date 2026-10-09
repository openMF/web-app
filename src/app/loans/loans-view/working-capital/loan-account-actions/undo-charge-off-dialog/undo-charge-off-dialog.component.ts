/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Models */
import { WorkingCapitalUndoChargeOffRequest } from 'app/loans/models/working-capital/working-capital-loan-account.model';

/** Typed controls of the undo charge-off dialog form. */
interface UndoChargeOffFormControls {
  reversalExternalId: FormControl<string | null>;
  note: FormControl<string | null>;
}

/** Result emitted when the user confirms the undo charge-off dialog. */
export interface WorkingCapitalUndoChargeOffDialogResult {
  confirm: boolean;
  reversalExternalId: string | null;
  note: string | null;
}

/**
 * Builds the command=undoChargeOff payload from the dialog result.
 * Empty optional fields are omitted because the backend rejects blank values.
 */
export function buildWorkingCapitalUndoChargeOffPayload(
  result: WorkingCapitalUndoChargeOffDialogResult,
  locale: string
): WorkingCapitalUndoChargeOffRequest {
  const payload: WorkingCapitalUndoChargeOffRequest = { locale };
  if (result.reversalExternalId) {
    payload.reversalExternalId = result.reversalExternalId;
  }
  if (result.note) {
    payload.note = result.note;
  }
  return payload;
}

/**
 * Confirmation dialog for undoing a Working Capital loan charge-off.
 * Collects the optional reversal external id and note; the caller performs
 * the actual POST command=undoChargeOff.
 */
@Component({
  selector: 'mifosx-wc-undo-charge-off-dialog',
  templateUrl: './undo-charge-off-dialog.component.html',
  styleUrls: ['./undo-charge-off-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CdkTextareaAutosize
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalUndoChargeOffDialogComponent {
  private dialogRef =
    inject<MatDialogRef<WorkingCapitalUndoChargeOffDialogComponent, WorkingCapitalUndoChargeOffDialogResult>>(
      MatDialogRef
    );

  /** Optional reversal fields for the undo charge-off command. */
  undoForm = new FormGroup<UndoChargeOffFormControls>({
    reversalExternalId: new FormControl<string | null>(null),
    note: new FormControl<string | null>(null)
  });

  confirm(): void {
    const { reversalExternalId, note } = this.undoForm.getRawValue();
    this.dialogRef.close({ confirm: true, reversalExternalId, note });
  }
}
