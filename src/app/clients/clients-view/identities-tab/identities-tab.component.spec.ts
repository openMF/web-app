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
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ClientsService } from '../../clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { IdentitiesTabComponent } from './identities-tab.component';

describe('IdentitiesTabComponent', () => {
  let component: IdentitiesTabComponent;
  let clientsService: jest.Mocked<ClientsService>;
  let documentPreviewService: jest.Mocked<DocumentPreviewService>;
  let markForCheck: jest.Mock;

  beforeEach(async () => {
    clientsService = {
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
        { provide: MatDialog, useValue: { open: jest.fn() } },
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
});
