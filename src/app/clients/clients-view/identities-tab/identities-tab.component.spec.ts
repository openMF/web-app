/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faEye, faFile, faPlus, faSync, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { IdentitiesTabComponent } from './identities-tab.component';
import { ClientsService } from 'app/clients/clients.service';
import { MemberBsDatesService } from 'app/clients/member-bs-dates.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

describe("IdentitiesTabComponent: an identity's file", () => {
  let component: IdentitiesTabComponent;
  let fixture: ComponentFixture<IdentitiesTabComponent>;
  /** What the Delete confirmation returns. */
  let confirmResult: any;
  let identity: any;
  let clientsService: Record<string, jest.Mock>;
  let dialogInstance: { submitted: EventEmitter<any>; applyServerError: jest.Mock };
  let dialogClose: jest.Mock;
  let previewService: { isPreviewable: () => boolean; release: jest.Mock };

  /** What the dialog emits on Submit: the identity's details, plus a file when one was chosen. */
  const submitted = (file?: File) => ({
    documentTypeId: 1,
    status: 'Active',
    documentKey: '27-01-71-12345',
    description: '',
    issuanceDate: null as Date | null,
    expiryDate: null as Date | null,
    fileName: file?.name ?? 'citizenship.pdf',
    file: file ?? ''
  });

  beforeEach(() => {
    identity = {
      id: 10,
      clientId: 793,
      documentKey: '27-01-71-12345',
      documentType: { id: 1, name: 'Citizenship' },
      status: 'clientIdentifierStatusType.active',
      documents: [{ id: 50, name: 'citizenship.pdf', fileName: 'citizenship.pdf', parentEntityId: 10 }]
    };
    clientsService = {
      editClientIdentifier: jest.fn(() => of({})),
      uploadClientIdentifierDocument: jest.fn(() => of({ resourceId: 51 })),
      deleteClientIdentifierDocument: jest.fn(() => of({})),
      downloadClientIdentificationDocument: jest.fn(() => of(new Blob()))
    };
    dialogInstance = { submitted: new EventEmitter<any>(), applyServerError: jest.fn() };
    dialogClose = jest.fn();
    previewService = { isPreviewable: () => false, release: jest.fn() };

    TestBed.configureTestingModule({
      imports: [
        IdentitiesTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { paramMap: of(convertToParamMap({ clientId: '793' })) },
            data: of({
              clientIdentities: [identity],
              clientIdentifierTemplate: { allowedDocumentTypes: [{ id: 1, name: 'Citizenship' }] }
            })
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: MemberBsDatesService, useValue: { saveIdentifierBsDates: jest.fn(() => of({})) } },
        { provide: DocumentPreviewService, useValue: previewService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ]
    });
    TestBed.overrideProvider(MatDialog, {
      useValue: {
        open: jest.fn(() => ({
          componentInstance: dialogInstance,
          close: dialogClose,
          afterClosed: () => of(confirmResult)
        }))
      }
    });
    TestBed.inject(FaIconLibrary).addIcons(faDownload, faEye, faFile, faPlus, faSync, faTrash, faUpload);
    fixture = TestBed.createComponent(IdentitiesTabComponent);
    component = fixture.componentInstance;
    // Renders the table, which saving an edit redraws.
    fixture.detectChanges();
  });

  it('uploads the file chosen in Edit and removes the one it replaces', () => {
    const scan = new File(['jpg'], 'citizenship-front.jpg');
    component.editIdentifier(identity);
    dialogInstance.submitted.emit(submitted(scan));

    const [
      identifierId,
      formData
    ] = clientsService.uploadClientIdentifierDocument.mock.calls[0] as [
      number,
      FormData
    ];
    expect(identifierId).toBe(10);
    expect(formData.get('file')).toBe(scan);
    expect(formData.get('name')).toBe('citizenship-front.jpg');
    expect(clientsService.deleteClientIdentifierDocument).toHaveBeenCalledWith(10, 50);
    expect(identity.documents).toEqual([expect.objectContaining({ id: 51, fileName: 'citizenship-front.jpg' })]);
    expect(previewService.release).toHaveBeenCalledWith(50);
    expect(dialogClose).toHaveBeenCalled();
  });

  it('attaches the file to an identity that had none', () => {
    identity.documents = [];
    component.editIdentifier(identity);
    dialogInstance.submitted.emit(submitted(new File(['%PDF'], 'citizenship.pdf')));

    expect(clientsService.uploadClientIdentifierDocument).toHaveBeenCalled();
    expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();
    expect(identity.documents).toEqual([expect.objectContaining({ id: 51 })]);
  });

  it('keeps the stored file and the dialog open when the upload fails', () => {
    const error = { error: { defaultUserMessage: 'File too large' } };
    clientsService.uploadClientIdentifierDocument.mockReturnValue(throwError(() => error));
    component.editIdentifier(identity);
    dialogInstance.submitted.emit(submitted(new File(['x'], 'big.pdf')));

    expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();
    expect(identity.documents).toEqual([expect.objectContaining({ id: 50 })]);
    expect(dialogInstance.applyServerError).toHaveBeenCalledWith(error);
    expect(dialogClose).not.toHaveBeenCalled();
  });

  it('leaves the file alone when Edit is saved without choosing one', () => {
    component.editIdentifier(identity);
    dialogInstance.submitted.emit(submitted());

    expect(clientsService.editClientIdentifier).toHaveBeenCalled();
    expect(clientsService.uploadClientIdentifierDocument).not.toHaveBeenCalled();
    expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();
    expect(dialogClose).toHaveBeenCalled();
  });
  describe('the open row', () => {
    /** Opens the identity's row and returns its file-action buttons by label. */
    const openRow = () => {
      // Opened as a user does, by clicking the row.
      fixture.nativeElement.querySelector('tr.identity-row').click();
      fixture.detectChanges();
      return (label: string) =>
        fixture.nativeElement.querySelectorAll(`.details-row button[aria-label^="labels.buttons.${label}"]`);
    };
    const choose = (file: File) => ({ target: { files: [file], value: 'C:\\fakepath\\x' } }) as any;

    it("shows Download, Replace and Delete on the identity's file", () => {
      const buttons = openRow();

      expect(buttons('Download').length).toBe(1);
      expect(buttons('Replace').length).toBe(1);
      expect(buttons('Delete').length).toBe(1);
    });

    it('shows Upload when the identity has no file', () => {
      identity.documents = [];
      openRow();

      expect(fixture.nativeElement.querySelector('.details-row .upload-file')?.textContent).toContain(
        'labels.buttons.Upload'
      );
    });

    it('uploads a file to an identity that has none', () => {
      identity.documents = [];
      const scan = new File(['%PDF'], 'citizenship.pdf');

      component.onIdentityFileChosen(identity, choose(scan));

      expect(((clientsService.uploadClientIdentifierDocument.mock.calls[0] as any[])[1] as FormData).get('file')).toBe(
        scan
      );
      expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();
      expect(identity.documents).toEqual([expect.objectContaining({ id: 51, fileName: 'citizenship.pdf' })]);
    });

    it('replaces the chosen file in its place, removing the old one after the upload', () => {
      const back = { id: 60, name: 'back.pdf', fileName: 'back.pdf' };
      identity.documents = [
        identity.documents[0],
        back
      ];

      component.onIdentityFileChosen(identity, choose(new File(['jpg'], 'back-new.jpg')), back);

      expect(clientsService.deleteClientIdentifierDocument).toHaveBeenCalledWith(10, 60);
      expect(identity.documents.map((doc: any) => doc.id)).toEqual([
        50,
        51
      ]);
    });

    it('keeps the file when Replace fails to upload', () => {
      clientsService.uploadClientIdentifierDocument.mockReturnValue(throwError(() => ({ status: 413 })));
      const stored = identity.documents[0];

      component.onIdentityFileChosen(identity, choose(new File(['x'], 'huge.pdf')), stored);

      expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();
      expect(identity.documents).toEqual([stored]);
    });

    it('downloads the file under its own name', () => {
      (URL as any).createObjectURL = jest.fn(() => 'blob:copy');
      (URL as any).revokeObjectURL = jest.fn();
      let downloadedAs = '';
      const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement
      ) {
        downloadedAs = this.download;
      });

      component.downloadIdentityDocument(identity, identity.documents[0]);

      expect(clientsService.downloadClientIdentificationDocument).toHaveBeenCalledWith(10, 50);
      expect(downloadedAs).toBe('citizenship.pdf');
      click.mockRestore();
    });

    it('deletes the file once confirmed, and not when the confirmation is dismissed', () => {
      confirmResult = undefined;
      component.deleteIdentityDocument(identity, identity.documents[0]);
      expect(clientsService.deleteClientIdentifierDocument).not.toHaveBeenCalled();

      confirmResult = { delete: true };
      component.deleteIdentityDocument(identity, identity.documents[0]);
      expect(clientsService.deleteClientIdentifierDocument).toHaveBeenCalledWith(10, 50);
      expect(identity.documents).toEqual([]);
      expect(previewService.release).toHaveBeenCalledWith(50);
    });
  });
});
