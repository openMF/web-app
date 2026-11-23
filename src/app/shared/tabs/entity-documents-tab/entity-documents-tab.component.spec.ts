/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faDownload,
  faEye,
  faFile,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faPen,
  faPlus,
  faTimes,
  faTrash,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { EntityDocumentsTabComponent } from './entity-documents-tab.component';
import { ClientsService } from 'app/clients/clients.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

/**
 * The component is OnPush and changes the list from dialog callbacks, so these tests assert the
 * rendered DOM: a list that only changes in memory stays stale on screen until a reload (the reported bug).
 */
describe('EntityDocumentsTabComponent', () => {
  let component: EntityDocumentsTabComponent;
  let fixture: ComponentFixture<EntityDocumentsTabComponent>;
  let dialogResult: any;
  /** What an Edit opens: the dialog's `submitted` output and error method, and its close. */
  let dialogInstance: { submitted: EventEmitter<any>; applyServerError: jest.Mock };
  let dialogClose: jest.Mock;
  let dialogOpen: jest.Mock;

  const renderedTitles = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.title')).map((el: any) => el.textContent.trim());

  beforeEach(async () => {
    dialogInstance = { submitted: new EventEmitter<any>(), applyServerError: jest.fn() };
    dialogClose = jest.fn();
    dialogOpen = jest.fn(() => ({
      afterClosed: () => of(dialogResult),
      componentInstance: dialogInstance,
      close: dialogClose
    }));
    await TestBed.configureTestingModule({
      imports: [
        EntityDocumentsTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        // A dated card shows the date in BS too, which loads the BS calendar.
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClientsService, useValue: { downloadClientDocument: jest.fn(() => of(new Blob(['%PDF']))) } },
        { provide: LoansService, useValue: {} },
        { provide: SavingsService, useValue: {} },
        { provide: DocumentPreviewService, useValue: { isPreviewable: () => false, release: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ]
    })
      .overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
      .compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(
      faDownload,
      faEye,
      faFile,
      faFileExcel,
      faFilePdf,
      faFileWord,
      faPen,
      faPlus,
      faTimes,
      faTrash,
      faUpload
    );

    fixture = TestBed.createComponent(EntityDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entityId', '1');
    fixture.componentRef.setInput('entityType', 'clients');
    fixture.componentRef.setInput('entityDocuments', [
      { id: 1, name: 'Passport' },
      { id: 2, name: 'Citizenship' }
    ]);
    fixture.componentRef.setInput('callbackDelete', jest.fn());
    fixture.componentRef.setInput(
      'callbackUpload',
      jest.fn(() => of({ resourceId: 3 }))
    );
    fixture.detectChanges();
  });

  it('removes a deleted document without a reload', () => {
    dialogResult = { delete: true };
    component.deleteDocument(1 as any, 'Passport');
    fixture.detectChanges();

    expect(component.callbackDelete).toHaveBeenCalledWith(1);
    expect(renderedTitles()).toEqual(['Citizenship']);
  });

  it('keeps the document when the delete dialog is dismissed', () => {
    dialogResult = undefined;
    component.deleteDocument(1 as any, 'Passport');
    fixture.detectChanges();

    expect(component.callbackDelete).not.toHaveBeenCalled();
    expect(renderedTitles()).toEqual([
      'Passport',
      'Citizenship'
    ]);
  });

  it('downloads a document under its file name from the download button', () => {
    (URL as any).createObjectURL = jest.fn(() => 'blob:doc');
    (URL as any).revokeObjectURL = jest.fn();
    let downloadedAs = '';
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadedAs = this.download;
    });
    component.entityDocuments[0].fileName = 'passport.pdf';

    fixture.nativeElement.querySelector('button[aria-label^="labels.buttons.Download"]').click();

    expect(TestBed.inject(ClientsService).downloadClientDocument).toHaveBeenCalledWith('1', 1);
    expect(downloadedAs).toBe('passport.pdf');
    click.mockRestore();
  });

  it('renders an uploaded document without a reload', () => {
    dialogResult = { fileName: 'Licence', description: '', file: new File([''], 'licence.png') };
    component.uploadDocument();
    fixture.detectChanges();

    expect(renderedTitles()).toEqual([
      'Passport',
      'Citizenship',
      'Licence'
    ]);
  });

  describe('Edit', () => {
    const editButtons = () => fixture.nativeElement.querySelectorAll('button[aria-label^="labels.buttons.Edit"]');
    const sent = (formData: FormData) => ({
      name: formData.get('name'),
      description: formData.get('description'),
      issuanceDate: formData.get('issuanceDate'),
      expiryDate: formData.get('expiryDate'),
      file: formData.get('file')
    });

    beforeEach(() => {
      fixture.componentRef.setInput(
        'callbackUpdate',
        jest.fn(() => of({ resourceId: 2 }))
      );
      fixture.componentRef.setInput('entityDocuments', [
        { id: 1, name: 'Passport', fileName: 'passport.pdf' },
        {
          id: 2,
          name: 'Citizenship',
          description: 'Front side',
          issuanceDate: '2020-11-17',
          fileName: 'citizenship.pdf'
        }
      ]);
      fixture.detectChanges();
    });

    it('shows an Edit action on every card', () => {
      expect(editButtons().length).toBe(2);
      expect(editButtons()[1].textContent).toContain('labels.buttons.Edit');
    });

    it('shows no Edit action when the page gives no way to save an edit', () => {
      fixture.componentRef.setInput('callbackUpdate', undefined);
      fixture.detectChanges();

      expect(editButtons().length).toBe(0);
    });

    it('opens the dialog pre-filled from the document, with the KYM names for a member', () => {
      editButtons()[1].click();

      const data = (dialogOpen.mock.calls[0] as any[])[1].data;
      expect(data.document).toEqual(expect.objectContaining({ id: 2, name: 'Citizenship', description: 'Front side' }));
      expect(data.kymDocumentNames).toContain('thumbprint-right');
    });

    it('saves without a new file, keeps the file, and updates the card in place', () => {
      component.editDocument(component.entityDocuments[1]);
      dialogInstance.submitted.emit({
        fileName: 'Citizenship (renewed)',
        description: 'Both sides',
        issuanceDate: new Date(2021, 0, 5),
        expiryDate: null,
        file: ''
      });
      fixture.detectChanges();

      const [
        documentId,
        formData
      ] = (component.callbackUpdate as jest.Mock).mock.calls[0] as [
        number,
        FormData
      ];
      expect(documentId).toBe(2);
      // No expiry date and no file part: the server keeps the stored expiry date and file.
      expect(sent(formData)).toEqual({
        name: 'Citizenship (renewed)',
        description: 'Both sides',
        issuanceDate: '2021-01-05',
        expiryDate: null,
        file: null
      });
      expect(renderedTitles()).toEqual([
        'Passport',
        'Citizenship (renewed)'
      ]);
      expect(component.entityDocuments[1].fileName).toBe('citizenship.pdf');
      expect(dialogClose).toHaveBeenCalled();
    });

    it('sends a new file and drops the old preview so the new file is shown', () => {
      const newFile = new File(['%PDF'], 'citizenship-new.pdf');
      component.editDocument(component.entityDocuments[1]);
      dialogInstance.submitted.emit({ fileName: 'Citizenship', description: '', file: newFile });

      const formData = ((component.callbackUpdate as jest.Mock).mock.calls[0] as [
          number,
          FormData
        ])[1];
      expect(formData.get('file')).toBe(newFile);
      expect(TestBed.inject(DocumentPreviewService).release).toHaveBeenCalledWith(2);
    });

    it('keeps a cleared description and date on the card, as the server keeps them', () => {
      component.editDocument(component.entityDocuments[1]);
      dialogInstance.submitted.emit({ fileName: 'Citizenship', description: '', issuanceDate: null, file: '' });

      expect(component.entityDocuments[1].description).toBe('Front side');
      expect(component.entityDocuments[1].issuanceDate).toBe('2020-11-17');
    });

    it('shows a server error in the dialog and leaves the card unchanged', () => {
      const error = { error: { defaultUserMessage: 'Document not found' } };
      fixture.componentRef.setInput(
        'callbackUpdate',
        jest.fn(() => throwError(() => error))
      );
      component.editDocument(component.entityDocuments[1]);
      dialogInstance.submitted.emit({ fileName: 'Renamed', description: '', file: '' });
      fixture.detectChanges();

      expect(dialogInstance.applyServerError).toHaveBeenCalledWith(error);
      expect(dialogClose).not.toHaveBeenCalled();
      expect(renderedTitles()).toEqual([
        'Passport',
        'Citizenship'
      ]);
    });
  });
});
