/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatomoTracker } from "@ngx-matomo/tracker";

@Component({
  selector: 'mifosx-edit-notes-dialog',
  templateUrl: './edit-notes-dialog.component.html',
  styleUrls: ['./edit-notes-dialog.component.scss']
})
export class EditNotesDialogComponent implements OnInit {
  noteForm: UntypedFormGroup;

  /**
  * @param {MatDialogRef} dialogRef Component reference to dialog.
  * @param {UntypedFormBuilder} formBuilder form builder
  * @param {any} data Documents data
  * @param {MatomoTracker} matomoTracker Matomo tracker service
  */

  constructor(public dialogRef: MatDialogRef<EditNotesDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matomoTracker: MatomoTracker) { }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': [this.data.noteContent, Validators.required]
    });

    //Track Matomo event for creating note
    this.matomoTracker.trackEvent('clients', 'createClientNote');
  }
}
