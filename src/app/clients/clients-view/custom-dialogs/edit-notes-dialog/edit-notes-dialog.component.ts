/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-notes-dialog',
  templateUrl: './edit-notes-dialog.component.html',
  styleUrls: ['./edit-notes-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose
  ]
})
export class EditNotesDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<EditNotesDialogComponent>>(MatDialogRef);
  private formBuilder = inject(UntypedFormBuilder);
  data = inject(MAT_DIALOG_DATA);

  noteForm: UntypedFormGroup;

  ngOnInit() {
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      note: [
        this.data.noteContent,
        Validators.required
      ]
    });
  }
}
