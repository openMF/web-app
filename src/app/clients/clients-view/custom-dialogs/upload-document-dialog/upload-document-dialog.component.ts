import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'mifosx-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss']
})
export class UploadDocumentDialogComponent implements OnInit {

  /** Upload Document form. */
  uploadDocumentForm: UntypedFormGroup;
  /** Upload Document Data */
  uploadDocumentData: any = [];
  /** Triggers description field */
  documentIdentifier = false;
  /** Entity Type */
  entityType: string;

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor(public dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
              private formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.documentIdentifier = data.documentIdentifier;
    this.entityType = data.entityType;
  }

  ngOnInit() {
    this.createUploadDocumentForm();
  }

  /**
   * Creates the upload Document form.
   */
  createUploadDocumentForm() {
    this.uploadDocumentForm = this.formBuilder.group({
      'fileName': ['', Validators.required],
      'description': [''],
      'file': ['']
    });
  }

  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.uploadDocumentForm.get('file').setValue(file);
    }
  }

}


