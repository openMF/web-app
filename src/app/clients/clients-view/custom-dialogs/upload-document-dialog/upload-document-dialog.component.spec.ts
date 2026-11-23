/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest } from '@jest/globals';

import { UploadDocumentDialogComponent } from './upload-document-dialog.component';

describe('UploadDocumentDialogComponent', () => {
  const citizenship = {
    id: 2,
    name: 'Citizenship',
    description: 'Front side',
    issuanceDate: [
      2020,
      11,
      17
    ],
    expiryDate: '2030-11-16',
    fileName: 'citizenship.pdf'
  };

  function create(data: any) {
    const dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [
        UploadDocumentDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    });
    TestBed.inject(FaIconLibrary).addIcons(faFolderOpen);
    const fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    fixture.detectChanges();
    return { component: fixture.componentInstance, dialogRef, fixture };
  }

  const pick = (component: UploadDocumentDialogComponent, file: File) =>
    component.onFileSelect({ target: { files: [file] } });

  describe('editing a document', () => {
    const edit = (document: any = citizenship, kymDocumentNames: string[] = []) =>
      create({ documentIdentifier: false, entityType: '', document, kymDocumentNames });

    it('pre-fills the name, description and both dates', () => {
      const { component } = edit();
      const value = component.uploadDocumentForm.value;

      expect(value.fileName).toBe('Citizenship');
      expect(value.description).toBe('Front side');
      expect(value.issuanceDate).toEqual(new Date(2020, 10, 17));
      expect(value.expiryDate).toEqual(new Date(2030, 10, 16));
    });

    it('can be saved without choosing a new file', () => {
      const { component } = edit();

      expect(component.uploadDocumentForm.valid).toBe(true);
    });

    it('takes a new file of the same type, and refuses one of another type', () => {
      const { component } = edit();

      pick(component, new File(['%PDF'], 'citizenship-2.PDF'));
      expect(component.uploadDocumentForm.valid).toBe(true);
      // The name typed for the document is kept, not replaced by the new file's name.
      expect(component.uploadDocumentForm.value.fileName).toBe('Citizenship');

      pick(component, new File(['jpg'], 'citizenship.jpg'));
      expect(component.uploadDocumentForm.controls['file'].getError('fileType')).toBe('PDF');
      expect(component.uploadDocumentForm.valid).toBe(false);
    });

    it('emits the value instead of closing, so a server error can be shown in the dialog', () => {
      const { component, dialogRef } = edit();
      let emitted: any;
      component.submitted.subscribe((value) => (emitted = value));

      component.onSubmitClick();

      expect(emitted.fileName).toBe('Citizenship');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('says a cleared description or date is kept', () => {
      const { component } = edit();
      expect(component.clearedValueKept).toBe(false);

      component.uploadDocumentForm.patchValue({ expiryDate: null });
      expect(component.clearedValueKept).toBe(true);
    });

    it('warns when renaming a KYM document means the KYM no longer counts it', () => {
      const thumbprint = { id: 5, name: 'Thumbprint-right', fileName: 'thumb.png' };
      const { component } = edit(thumbprint, [
        'thumbprint-right',
        'thumbprint-left'
      ]);
      expect(component.kymNameLost).toBeNull();

      component.uploadDocumentForm.patchValue({ fileName: 'thumbprint-right (rescanned)' });
      expect(component.kymNameLost).toBeNull();

      component.uploadDocumentForm.patchValue({ fileName: 'Right thumb' });
      expect(component.kymNameLost).toBe('thumbprint-right');
    });
  });

  describe('uploading a document', () => {
    it('starts blank, needs a name, and closes with the value as before', () => {
      const { component, dialogRef } = create({ documentIdentifier: false, entityType: '' });
      expect(component.uploadDocumentForm.value.fileName).toBe('');
      expect(component.uploadDocumentForm.valid).toBe(false);

      pick(component, new File(['x'], 'licence.jpg'));
      component.onSubmitClick();

      expect(dialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'licence.jpg' }));
    });
  });
});
