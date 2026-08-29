/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: 'mifosx-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadDocumentDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<UploadDocumentDialogComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  data = inject(MAT_DIALOG_DATA);

  /** Upload Document form. */
  uploadDocumentForm: FormGroup;
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
  /** Edit mode for identifiers */
  editIdentifier = false;

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor() {
    const data = this.data;

    this.documentIdentifier = data.documentIdentifier;
    this.entityType = data.entityType;
    this.allowedDocumentTypes = data.allowedDocumentTypes || [];
    this.statusOptions = data.statusOptions || [];
    this.editIdentifier = data.editIdentifier || false;
  }

  ngOnInit() {
    this.createUploadDocumentForm();
  }

  get fileNameRequired(): boolean {
    return !this.documentIdentifier || !this.editIdentifier;
  }

  /**
   * Creates the upload Document form.
   */
  createUploadDocumentForm() {
    if (this.documentIdentifier) {
      // Unified form for identity: identifier fields + document upload
      this.uploadDocumentForm = this.formBuilder.group({
        documentTypeId: [
          this.data.identifier?.documentType?.id || '',
          Validators.required
        ],
        status: [
          this.data.identifier?.status === 'clientIdentifierStatusType.inactive' ? 'Inactive' : 'Active',
          Validators.required
        ],
        documentKey: [
          this.data.identifier?.documentKey || '',
          Validators.required
        ],
        description: [this.data.identifier?.description || ''],
        issuanceDate: [this.parseIdentifierDate(this.data.identifier?.issuanceDate)],
        expiryDate: [this.parseIdentifierDate(this.data.identifier?.expiryDate)],
        fileName: [
          this.data.identifier?.documents?.[0]?.fileName || this.data.identifier?.documents?.[0]?.name || '',
          this.fileNameRequired ? Validators.required : []
        ],
        file: ['']
      });
    } else {
      // Standard document upload form
      const document = this.data.document || {};
      this.uploadDocumentForm = this.formBuilder.group({
        fileName: [
          document.fileName || document.name || '',
          Validators.required
        ],
        description: [document.description || ''],
        issuanceDate: [this.parseDate(document.issuanceDate)],
        expiryDate: [this.parseDate(document.expiryDate)],
        file: ['']
      });
    }
  }

  /**
   * Sets file form control value.
   * and also sets the fileName
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.uploadDocumentForm.get('fileName').setValue(file.name);
      this.uploadDocumentForm.get('file').setValue(file);
    }
  }

  private parseIdentifierDate(value: any): Date | string {
    return this.parseDate(value);
  }

  private parseDate(value: any): Date | string {
    return value ? this.dateUtils.parseDate(value) : '';
  }
}
