/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ClientsService } from '../../clients.service';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { IdentitiesTabComponent } from './identities-tab.component';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

describe('IdentitiesTabComponent', () => {
  let component: IdentitiesTabComponent;
  let clientsService: jest.Mocked<ClientsService>;
  let documentPreviewService: jest.Mocked<DocumentPreviewService>;
  let markForCheck: jest.Mock;
  let dialog: { open: jest.Mock };
  let dateUtils: { formatDate: jest.Mock; parseDate: jest.Mock };
  let alertService: { alert: jest.Mock };

  beforeEach(async () => {
    clientsService = {
      addClientIdentifier: jest.fn(() => of({ resourceId: 'identifier-3' })),
      editClientIdentifier: jest.fn(() => of({})),
      uploadClientIdentifierDocument: jest.fn(() => of({ resourceId: 'doc-3' })),
      downloadClientIdentificationDocument: jest.fn(() => of(new Blob(['image'], { type: 'image/png' })))
    } as any;
    documentPreviewService = {
      isPreviewable: jest.fn(() => true),
      resolvePreviewUrl: jest.fn((document: any, downloadFn: any) => {
        downloadFn(document);
        return Promise.resolve({ url: `blob:${document.id}`, type: 'image' });
      }),
      release: jest.fn()
    } as any;
    dialog = { open: jest.fn() };
    alertService = { alert: jest.fn() };
    dateUtils = {
      formatDate: jest.fn(
        (value: Date) =>
          `formatted:${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
            value.getDate()
          ).padStart(2, '0')}`
      ),
      parseDate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        IdentitiesTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        },
        { provide: DocumentPreviewService, useValue: documentPreviewService },
        { provide: MatDialog, useValue: dialog },
        { provide: AlertService, useValue: alertService },
        { provide: Dates, useValue: dateUtils },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                paramMap: {
                  get: jest.fn(() => 'client-99')
                }
              }
            },
            data: of({ clientIdentities: [], clientIdentifierTemplate: { allowedDocumentTypes: [] } })
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(IdentitiesTabComponent);
    component = fixture.componentInstance;
    markForCheck = jest.fn();
    (component as any).changeDetectorRef = { markForCheck };
    (component as any).identifiersTable = { renderRows: jest.fn() };
    component.clientIdentifierTemplate = {
      allowedDocumentTypes: [
        {
          id: 5,
          name: 'Passport'
        }
      ]
    };
  });

  it('uses document parentEntityId when resolving a thumbnail', async () => {
    (component as any).setThumbnail({
      id: 'doc-1',
      parentEntityId: 'identifier-1',
      fileName: 'front.png'
    });

    await Promise.resolve();

    expect(clientsService.downloadClientIdentificationDocument).toHaveBeenCalledWith('identifier-1', 'doc-1');
    expect(clientsService.downloadClientIdentificationDocument).not.toHaveBeenCalledWith('client-99', 'doc-1');
    expect(component.previewThumbnails).toEqual({ 'doc-1': 'blob:doc-1' });
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it('falls back to identity id instead of client id when document parentEntityId is absent', async () => {
    (component as any).setThumbnail(
      {
        id: 'doc-2',
        fileName: 'back.png'
      },
      { id: 'identifier-2' }
    );

    await Promise.resolve();

    expect(clientsService.downloadClientIdentificationDocument).toHaveBeenCalledWith('identifier-2', 'doc-2');
    expect(clientsService.downloadClientIdentificationDocument).not.toHaveBeenCalledWith('client-99', 'doc-2');
    expect(component.previewThumbnails).toEqual({ 'doc-2': 'blob:doc-2' });
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it('adds issuance and expiry dates to the create payload using Fineract date settings', () => {
    const issuanceDate = new Date('2026-01-15T00:00:00');
    const expiryDate = new Date('2028-01-15T00:00:00');
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          documentTypeId: 5,
          status: 'Active',
          documentKey: 'A-123',
          description: 'Passport',
          issuanceDate,
          expiryDate
        })
    });

    component.addIdentifier();

    expect(dateUtils.formatDate).toHaveBeenCalledWith(issuanceDate, 'dd MMMM yyyy');
    expect(dateUtils.formatDate).toHaveBeenCalledWith(expiryDate, 'dd MMMM yyyy');
    expect(clientsService.addClientIdentifier).toHaveBeenCalledWith('client-99', {
      documentTypeId: 5,
      status: 'Active',
      documentKey: 'A-123',
      description: 'Passport',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      issuanceDate: 'formatted:2026-01-15',
      expiryDate: 'formatted:2028-01-15'
    });
  });

  it('updates identifier dates without sending status and sends null when optional dates are cleared', () => {
    const identity: any = {
      id: 'identifier-4',
      documentType: { id: 5, name: 'Passport' },
      documentKey: 'OLD',
      description: 'Old value',
      issuanceDate: [
        2026,
        1,
        15
      ],
      expiryDate: [
        2028,
        1,
        15
      ],
      status: 'clientIdentifierStatusType.active'
    };
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          documentTypeId: 5,
          documentKey: 'NEW',
          description: 'New value',
          issuanceDate: '',
          expiryDate: null
        })
    });

    component.editIdentifier(identity);

    expect(clientsService.editClientIdentifier).toHaveBeenCalledWith('client-99', 'identifier-4', {
      documentTypeId: 5,
      documentKey: 'NEW',
      description: 'New value',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      issuanceDate: null,
      expiryDate: null
    });
    expect(identity).toMatchObject({
      description: 'New value',
      documentKey: 'NEW',
      issuanceDate: null,
      expiryDate: null,
      status: 'clientIdentifierStatusType.active'
    });
  });

  it('keeps identifier edits and reports an error when replacement document upload fails', () => {
    const identity: any = {
      id: 'identifier-5',
      documentType: { id: 5, name: 'Passport' },
      documentKey: 'OLD',
      description: 'Old value',
      status: 'clientIdentifierStatusType.active',
      documents: []
    };
    const replacement = new File(['replacement'], 'replacement.pdf', { type: 'application/pdf' });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    clientsService.uploadClientIdentifierDocument.mockReturnValue(throwError(() => new Error('upload failed')) as any);
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          documentTypeId: 5,
          documentKey: 'NEW',
          description: 'New value',
          issuanceDate: '',
          expiryDate: '',
          fileName: 'replacement.pdf',
          file: replacement
        })
    });

    component.editIdentifier(identity);

    expect(clientsService.editClientIdentifier).toHaveBeenCalled();
    expect(clientsService.uploadClientIdentifierDocument).toHaveBeenCalledWith('identifier-5', expect.any(FormData));
    expect(identity).toMatchObject({
      description: 'New value',
      documentKey: 'NEW'
    });
    expect(alertService.alert).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to upload document'
    });
  });
});
