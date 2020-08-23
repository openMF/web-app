/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'mifosx-edit-notes-dialog',
  templateUrl: './edit-notes-dialog.component.html',
  styleUrls: ['./edit-notes-dialog.component.scss']
})
export class EditNotesDialogComponent implements OnInit {
  noteForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<EditNotesDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': [this.data.noteContent, Validators.required]
    });
  }
}
