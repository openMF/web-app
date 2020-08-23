import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'mifosx-loan-account-load-documents-dialog',
  templateUrl: './loan-account-load-documents-dialog.component.html',
  styleUrls: ['./loan-account-load-documents-dialog.component.scss']
})
export class LoanAccountLoadDocumentsDialogComponent implements OnInit {

  /** Upload Document form. */
  uploadDocumentForm: FormGroup;

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor(public dialogRef: MatDialogRef<LoanAccountLoadDocumentsDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.createUploadDocumentForm();
  }

  /**
   * Creates the upload Document form.
   */
  createUploadDocumentForm() {
    this.uploadDocumentForm = this.formBuilder.group({
      'name': ['', Validators.required],
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
