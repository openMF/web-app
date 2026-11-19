/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { from, of, mergeMap, catchError, finalize, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { LoanDocument, documentSize, documentTitle } from './loan-document-presentation.utils';
export const LOAN_DOCUMENT_ACCEPT = '.xls,.xlsx,.pdf,.doc,.docx,.png,.jpeg,.jpg';
export interface LoanUploadEntry {
  file: File;
  form: FormGroup;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  progress?: number;
}
interface UploadDialogData {
  loanId: string;
  files?: File[];
  expectedNumber?: number;
  document?: LoanDocument;
  onBatchComplete: () => void;
}
@Component({
  selector: 'mifosx-loan-document-upload-dialog',
  templateUrl: './loan-document-upload-dialog.component.html',
  styleUrls: ['./loan-document-upload-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatProgressBarModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDocumentUploadDialogComponent {
  readonly data = inject<UploadDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<LoanDocumentUploadDialogComponent>);
  private fb = inject(FormBuilder);
  private loans = inject(LoansService);
  private settings = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  readonly accept = LOAN_DOCUMENT_ACCEPT;
  readonly size = documentSize;
  entries: LoanUploadEntry[] = [];
  busy = false;
  invalidFiles = false;
  updateFailed = false;
  metadataForm = this.metadata(this.data.document);
  constructor() {
    this.addFiles(this.data.files || []);
  }
  private metadata(doc?: LoanDocument): FormGroup {
    const date = (value?: string | number[]) =>
      Array.isArray(value)
        ? `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}`
        : value?.slice(0, 10) || '';
    return this.fb.group({ name: [
        doc?.name || '',
        [
          Validators.required,
          Validators.pattern(/\S/)
        ]
      ], description: [
        doc?.description || ''
      ], issuanceDate: [date(doc?.issuanceDate)], expiryDate: [date(doc?.expiryDate)] });
  }
  addFiles(files: File[]): void {
    if (this.busy || this.data.document) return;
    for (const file of files) {
      if (!file.size || !LOAN_DOCUMENT_ACCEPT.split(',').includes('.' + file.name.split('.').pop()?.toLowerCase())) {
        this.invalidFiles = true;
        continue;
      }
      const form = this.metadata({ id: 0, name: documentTitle({ id: 0, fileName: file.name }) || file.name });
      this.entries.push({ file, form, status: 'pending' });
    }
    this.cdr.markForCheck();
  }
  select(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files || []));
    input.value = '';
  }
  drop(event: DragEvent): void {
    event.preventDefault();
    this.addFiles(Array.from(event.dataTransfer?.files || []));
  }
  formData(form: FormGroup, file?: File): FormData {
    const data = new FormData();
    for (const [
      key,
      value
    ] of Object.entries(form.getRawValue())) {
      if (value !== '' && value != null) data.append(key, String(value));
    }
    data.append('dateFormat', 'yyyy-MM-dd');
    data.append('locale', this.settings.language.code);
    if (file) data.append('file', file, file.name);
    return data;
  }
  get ready(): boolean {
    return (
      !this.busy &&
      this.entries.some((entry) => entry.status === 'pending') &&
      this.entries.filter((entry) => entry.status === 'pending').every((entry) => entry.form.valid)
    );
  }
  upload(entries = this.entries.filter((entry) => entry.status === 'pending')): void {
    if (this.busy || !entries.length || entries.some((entry) => entry.form.invalid)) return;
    this.busy = true;
    this.ref.disableClose = true;
    const batch = entries.map((entry) => {
      const formData = this.formData(entry.form, entry.file);
      entry.form.disable();
      return { entry, formData };
    });
    from(batch)
      .pipe(
        mergeMap(({ entry, formData }) => {
          entry.status = 'uploading';
          entry.progress = undefined;
          return this.loans.uploadLoanDocumentWithProgress(this.data.loanId, formData).pipe(
            tap((event) => {
              if (event.type === HttpEventType.UploadProgress)
                entry.progress = event.total ? Math.round((100 * event.loaded) / event.total) : undefined;
              if (event.type === HttpEventType.Response) entry.status = 'success';
              this.cdr.markForCheck();
            }),
            catchError(() => {
              entry.status = 'failed';
              entry.form.enable();
              return of(null);
            }),
            finalize(() => {
              if (entry.status === 'uploading') {
                entry.status = 'failed';
                entry.form.enable();
              }
              this.cdr.markForCheck();
            })
          );
        }, 2),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.ref.disableClose = false;
          this.data.onBatchComplete();
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }
  saveMetadata(): void {
    if (this.busy || this.metadataForm.invalid) return;
    this.busy = true;
    this.updateFailed = false;
    this.ref.disableClose = true;
    this.metadataForm.disable();
    this.cdr.markForCheck();
    this.loans
      .updateLoanDocumentMetadata(this.data.loanId, String(this.data.document.id), this.formData(this.metadataForm))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.ref.disableClose = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.data.onBatchComplete();
          this.ref.close();
        },
        error: () => {
          this.updateFailed = true;
          this.metadataForm.enable();
        }
      });
  }
}
