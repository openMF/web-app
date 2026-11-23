/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faFile, faPlus } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { IdentitiesTabComponent } from './identities-tab.component';
import { ClientsService } from 'app/clients/clients.service';
import { MemberBsDatesService } from 'app/clients/member-bs-dates.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

describe('IdentitiesTabComponent: Edit with a file', () => {
  let component: IdentitiesTabComponent;
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
      useValue: { open: jest.fn(() => ({ componentInstance: dialogInstance, close: dialogClose })) }
    });
    TestBed.inject(FaIconLibrary).addIcons(faEye, faFile, faPlus);
    const fixture = TestBed.createComponent(IdentitiesTabComponent);
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
});
