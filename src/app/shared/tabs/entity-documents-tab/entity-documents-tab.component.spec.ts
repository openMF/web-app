/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faFile, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { EntityDocumentsTabComponent } from './entity-documents-tab.component';

describe('EntityDocumentsTabComponent', () => {
  let fixture: ComponentFixture<EntityDocumentsTabComponent>;
  let component: EntityDocumentsTabComponent;
  let clientsService: jest.Mocked<ClientsService>;
  let documentPreviewService: jest.Mocked<DocumentPreviewService>;

  beforeEach(async () => {
    clientsService = {
      downloadClientDocument: jest.fn()
    } as any;
    documentPreviewService = {
      isPreviewable: jest.fn(() => true),
      resolvePreviewUrl: jest.fn((document: any, downloadFn: any) => {
        downloadFn(document);
        return Promise.resolve({ url: 'blob:document', type: 'image' });
      }),
      release: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        EntityDocumentsTabComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: LoansService, useValue: {} },
        { provide: SavingsService, useValue: {} },
        { provide: DocumentPreviewService, useValue: documentPreviewService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        { provide: MatDialog, useValue: { open: jest.fn(() => ({ afterClosed: () => of(null) })) } }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faEye, faFile, faPlus, faTimes);

    fixture = TestBed.createComponent(EntityDocumentsTabComponent);
    component = fixture.componentInstance;
    component.entityId = '3616';
    component.entityType = 'clients';
    component.callbackUpload = jest.fn(() => of({}));
    component.callbackDelete = jest.fn();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.restoreAllMocks();
  });

  it.each([
    -1,
    Number.POSITIVE_INFINITY,
    'Infinity'
  ])('does not prefetch a thumbnail for an invalid client document id: %s', (documentId) => {
    component.entityDocuments = [{ id: documentId, name: 'profile-image.png', fileName: 'profile-image.png' }];

    fixture.detectChanges();

    expect(component.isPreviewable(component.entityDocuments[0])).toBe(false);
    expect(documentPreviewService.resolvePreviewUrl).not.toHaveBeenCalled();
    expect(clientsService.downloadClientDocument).not.toHaveBeenCalled();
  });

  it('prefetches a thumbnail for a valid client document id', async () => {
    component.entityDocuments = [{ id: 45, name: 'profile-image.png', fileName: 'profile-image.png' }];
    clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['image'], { type: 'image/png' })) as any);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isPreviewable(component.entityDocuments[0])).toBe(true);
    expect(documentPreviewService.resolvePreviewUrl).toHaveBeenCalled();
    expect(clientsService.downloadClientDocument).toHaveBeenCalledWith('3616', 45);
  });
});
