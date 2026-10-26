/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent
} from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'mifosx-undo-dialog',
  templateUrl: './undo-dialog.component.html',
  styleUrl: './undo-dialog.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose
  ]
})
export class UndoDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<UndoDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  undoActionForm: UntypedFormGroup | null = null;

  ngOnInit() {
    this.createUndoActionForm();
  }

  createUndoActionForm() {
    this.undoActionForm = this.formBuilder.group({
      note: ['']
    });
  }
}
