/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { LoanDocumentUploadDialogComponent } from './loan-document-upload-dialog.component';
describe('loan-only multi-file upload', () => {
  let component: LoanDocumentUploadDialogComponent;
  let loans: any;
  let data: any;
  let ref: any;
  beforeEach(async () => {
    loans = {
      uploadLoanDocumentWithProgress: jest.fn(() => of(new HttpResponse({ body: { resourceId: 1 } }))),
      updateLoanDocumentMetadata: jest.fn(() => of({ resourceId: 1 }))
    };
    data = { loanId: '42', onBatchComplete: jest.fn() };
    ref = { close: jest.fn(), disableClose: false };
    await TestBed.configureTestingModule({
      imports: [
        LoanDocumentUploadDialogComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: ref },
        { provide: LoansService, useValue: loans },
        { provide: SettingsService, useValue: { language: { code: 'en' } } }
      ]
    }).compileComponents();
    component = TestBed.createComponent(LoanDocumentUploadDialogComponent).componentInstance;
  });
  it('accepts multiple selection and drag/drop and validates existing file types', () => {
    component.addFiles([
      new File(['a'], 'a.pdf'),
      new File(['b'], 'b.xlsx'),
      new File(['x'], 'bad.exe'),
      new File([], 'empty.jpg')
    ]);
    expect(component.entries).toHaveLength(2);
    expect(component.invalidFiles).toBe(true);
    const preventDefault = jest.fn();
    component.drop({ preventDefault, dataTransfer: { files: [new File(['c'], 'c.png')] } } as any);
    expect(preventDefault).toHaveBeenCalled();
    expect(component.entries).toHaveLength(3);
  });
  it('preserves all multipart fields and the original binary filename', () => {
    const file = new File(['a'], 'a.pdf');
    component.addFiles([file]);
    const entry = component.entries[0];
    entry.form.patchValue({
      name: 'Readable',
      description: 'Description',
      issuanceDate: '2026-01-02',
      expiryDate: '2027-01-02'
    });
    const form = component.formData(entry.form, file);
    expect(form.get('name')).toBe('Readable');
    expect(form.get('description')).toBe('Description');
    expect(form.get('issuanceDate')).toBe('2026-01-02');
    expect(form.get('expiryDate')).toBe('2027-01-02');
    expect(form.get('locale')).toBe('en');
    expect(form.get('dateFormat')).toBe('yyyy-MM-dd');
    expect((form.get('file') as File).name).toBe('a.pdf');
    expect(form.has('number')).toBe(false);
  });
  it('bounds concurrency, tracks independent progress, isolates failures and retries only explicitly', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    const third = new Subject<any>();
    loans.uploadLoanDocumentWithProgress
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(third);
    component.addFiles(
      [
        'a',
        'b',
        'c'
      ].map((n) => new File(['a'], n + '.pdf'))
    );
    component.upload();
    expect(loans.uploadLoanDocumentWithProgress).toHaveBeenCalledTimes(2);
    expect(component.entries.map((e) => e.status)).toEqual([
      'uploading',
      'uploading',
      'pending'
    ]);
    expect(ref.disableClose).toBe(true);
    first.next({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
    expect(component.entries[0].progress).toBe(50);
    expect(component.entries[0].status).toBe('uploading');
    first.next(new HttpResponse({ body: { resourceId: 1 } }));
    first.complete();
    expect(loans.uploadLoanDocumentWithProgress).toHaveBeenCalledTimes(3);
    second.error(new Error('uncertain'));
    third.next(new HttpResponse({ body: { resourceId: 3 } }));
    third.complete();
    expect(component.entries.map((e) => e.status)).toEqual([
      'success',
      'failed',
      'success'
    ]);
    expect(data.onBatchComplete).toHaveBeenCalledTimes(1);
    expect(component.busy).toBe(false);
    expect(ref.disableClose).toBe(false);
    expect(loans.uploadLoanDocumentWithProgress).toHaveBeenCalledTimes(3);
    component.upload([component.entries[1]]);
    expect(loans.uploadLoanDocumentWithProgress).toHaveBeenCalledTimes(4);
    expect(component.entries[1].status).toBe('success');
  });

  it('locks and snapshots queued metadata before starting the two active uploads', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    const third = new Subject<any>();
    loans.uploadLoanDocumentWithProgress
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(third);
    component.addFiles(
      [
        'a',
        'b',
        'c'
      ].map((name) => new File(['x'], `${name}.pdf`))
    );
    const queued = component.entries[2];
    queued.form.patchValue({ name: 'Queued custom name' });
    component.upload();
    expect(component.entries.every((entry) => entry.form.disabled)).toBe(true);
    expect(queued.status).toBe('pending');
    // Even an external programmatic update cannot change the validated queued request.
    queued.form.patchValue({ name: '' });
    first.next(new HttpResponse({ body: { resourceId: 1 } }));
    first.complete();
    const queuedRequest = loans.uploadLoanDocumentWithProgress.mock.calls[2][1] as FormData;
    expect(queuedRequest.get('name')).toBe('Queued custom name');
    second.error(new Error('failed'));
    expect(component.entries[1].form.enabled).toBe(true);
    third.next(new HttpResponse({ body: { resourceId: 3 } }));
    third.complete();
    expect(queued.status).toBe('success');
    expect(component.busy).toBe(false);
  });
  it('does not call an HTTP 100% upload event success before the response', () => {
    const events = new Subject<any>();
    loans.uploadLoanDocumentWithProgress.mockReturnValue(events);
    component.addFiles([new File(['x'], 'x.pdf')]);
    component.upload();
    events.next({ type: HttpEventType.UploadProgress, loaded: 1, total: 1 });
    expect(component.entries[0].status).toBe('uploading');
    events.error(new Error('server failed'));
    expect(component.entries[0].status).toBe('failed');
  });
  it('sends metadata-only updates without a file and refreshes only after server confirmation', () => {
    data.document = { id: 7 };
    component.metadataForm.patchValue({ name: 'Changed' });
    const result = new Subject<any>();
    loans.updateLoanDocumentMetadata.mockReturnValue(result);
    component.saveMetadata();
    expect((loans.updateLoanDocumentMetadata.mock.calls[0][2] as FormData).has('file')).toBe(false);
    expect(data.onBatchComplete).not.toHaveBeenCalled();
    expect(component.metadataForm.disabled).toBe(true);
    result.next({ resourceId: 7 });
    result.complete();
    expect(data.onBatchComplete).toHaveBeenCalledTimes(1);
    expect(ref.close).toHaveBeenCalled();
  });

  it('disables metadata controls throughout a pending save and re-enables them after failure', () => {
    data.document = { id: 7 };
    component.metadataForm.patchValue({ name: 'Saved A' });
    const response = new Subject<any>();
    loans.updateLoanDocumentMetadata.mockReturnValue(response);
    component.saveMetadata();
    expect(component.busy).toBe(true);
    expect(component.metadataForm.disabled).toBe(true);
    expect(Object.values(component.metadataForm.controls).every((control) => control.disabled)).toBe(true);
    expect((loans.updateLoanDocumentMetadata.mock.calls[0][2] as FormData).get('name')).toBe('Saved A');
    expect(ref.close).not.toHaveBeenCalled();
    response.error(new Error('failed'));
    expect(component.metadataForm.enabled).toBe(true);
    expect(component.busy).toBe(false);
    expect(component.updateFailed).toBe(true);
    expect(ref.close).not.toHaveBeenCalled();
  });
  it('does not dismiss or refresh on metadata failure', () => {
    data.document = { id: 7 };
    component.metadataForm.patchValue({ name: 'Changed' });
    loans.updateLoanDocumentMetadata.mockReturnValue(throwError(() => new Error('failed')));
    component.saveMetadata();
    expect(component.updateFailed).toBe(true);
    expect(data.onBatchComplete).not.toHaveBeenCalled();
    expect(ref.close).not.toHaveBeenCalled();
  });
});
