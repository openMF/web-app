/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-edit-notes-dialog',
  templateUrl: './edit-notes-dialog.component.html',
  styleUrls: ['./edit-notes-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class EditNotesDialogComponent implements OnInit {
  noteForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditNotesDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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
