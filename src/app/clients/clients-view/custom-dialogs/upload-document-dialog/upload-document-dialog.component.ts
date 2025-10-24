import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class UploadDocumentDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<UploadDocumentDialogComponent>>(MatDialogRef);
  private formBuilder = inject(UntypedFormBuilder);
  data = inject(MAT_DIALOG_DATA);

  /** Upload Document form. */
  uploadDocumentForm: UntypedFormGroup;
  /** Upload Document Data */
  uploadDocumentData: any = [];
  /** Triggers description field */
  documentIdentifier = false;
  /** Entity Type */
  entityType: string;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor() {
    const data = this.data;

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
      fileName: [
        '',
        Validators.required
      ],
      description: [''],
      file: ['']
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
