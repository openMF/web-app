import { Component, OnInit, Inject } from '@angular/core';
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
  /** Upload Document form. */
  uploadDocumentForm: UntypedFormGroup;
  /** Upload Document Data */
  uploadDocumentData: any = [];
  /** Triggers identity fields (documentType, status, documentKey) */
  documentIdentifier = false;
  /** Entity Type */
  entityType: string;
  /** Allowed Document Types for identifiers */
  allowedDocumentTypes: any[] = [];
  /** Status options for identifiers */
  statusOptions: any[] = [];

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor(
    public dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.documentIdentifier = data.documentIdentifier;
    this.entityType = data.entityType;
    this.allowedDocumentTypes = data.allowedDocumentTypes || [];
    this.statusOptions = data.statusOptions || [];
  }

  ngOnInit() {
    this.createUploadDocumentForm();
  }

  /**
   * Creates the upload Document form.
   */
  createUploadDocumentForm() {
    if (this.documentIdentifier) {
      // Unified form for identity: identifier fields + document upload
      this.uploadDocumentForm = this.formBuilder.group({
        documentTypeId: [
          '',
          Validators.required
        ],
        status: [
          'Active',
          Validators.required
        ],
        documentKey: [
          '',
          Validators.required
        ],
        description: [''],
        fileName: [
          '',
          Validators.required
        ],
        file: ['']
      });
    } else {
      // Standard document upload form
      this.uploadDocumentForm = this.formBuilder.group({
        fileName: [
          '',
          Validators.required
        ],
        description: [''],
        file: ['']
      });
    }
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
