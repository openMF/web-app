/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { UploadDocumentDialogComponent } from './upload-document-dialog.component';

describe('UploadDocumentDialogComponent', () => {
  let component: UploadDocumentDialogComponent;
  let fixture: ComponentFixture<UploadDocumentDialogComponent>;
  let dialogData: any;

  const createComponent = async (data: any) => {
    dialogData = data;
    await TestBed.configureTestingModule({
      imports: [
        UploadDocumentDialogComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useFactory: () => dialogData }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faFolderOpen);

    fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows prefilled file and date controls for standard document edit', async () => {
    await createComponent({
      documentIdentifier: false,
      editIdentifier: true,
      entityType: 'clients',
      document: {
        fileName: 'passport.pdf',
        description: 'Passport',
        issuanceDate: '2024-01-02',
        expiryDate: '2030-06-30'
      }
    });

    expect(component.uploadDocumentForm.get('fileName').value).toBe('passport.pdf');
    expect(component.uploadDocumentForm.get('description').value).toBe('Passport');
    expect(component.uploadDocumentForm.get('file').value).toBe('');
    expect(component.uploadDocumentForm.valid).toBe(true);
    expect(fixture.debugElement.query(By.css('input[formControlName="fileName"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('mifosx-file-upload'))).toBeTruthy();
    expect(component.uploadDocumentForm.get('issuanceDate').value).toEqual(new Date(2024, 0, 2));
    expect(component.uploadDocumentForm.get('expiryDate').value).toEqual(new Date(2030, 5, 30));
  });

  it('keeps replacement file optional but updates file controls when selected during standard document edit', async () => {
    await createComponent({
      documentIdentifier: false,
      editIdentifier: true,
      document: {
        fileName: 'original.pdf'
      }
    });
    const replacement = new File(['replacement'], 'replacement.pdf', { type: 'application/pdf' });

    component.onFileSelect({ target: { files: [replacement] } });

    expect(component.uploadDocumentForm.get('fileName').value).toBe('replacement.pdf');
    expect(component.uploadDocumentForm.get('file').value).toBe(replacement);
    expect(component.uploadDocumentForm.valid).toBe(true);
  });

  it('shows optional prefilled file controls for client identifier edit', async () => {
    await createComponent({
      documentIdentifier: true,
      editIdentifier: true,
      identifier: {
        documentType: { id: 1 },
        status: 'clientIdentifierStatusType.active',
        documentKey: 'ABC123',
        documents: [{ fileName: 'passport.pdf' }]
      },
      allowedDocumentTypes: [{ id: 1, name: 'Passport' }],
      statusOptions: [{ label: 'Active', value: 'Active' }]
    });

    expect(component.uploadDocumentForm.get('fileName').value).toBe('passport.pdf');
    expect(component.uploadDocumentForm.get('file').value).toBe('');
    expect(component.uploadDocumentForm.valid).toBe(true);
    expect(fixture.debugElement.query(By.css('input[formControlName="fileName"]')).nativeElement.required).toBe(false);
    expect(fixture.debugElement.query(By.css('mifosx-file-upload'))).toBeTruthy();
  });
});
