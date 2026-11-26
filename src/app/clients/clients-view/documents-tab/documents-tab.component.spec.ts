/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faEye, faFile, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { DocumentsTabComponent } from './documents-tab.component';
import { EntityDocumentsTabComponent } from 'app/shared/tabs/entity-documents-tab/entity-documents-tab.component';
import { ClientsService } from '../../clients.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';

describe('DocumentsTabComponent', () => {
  let fixture: ComponentFixture<DocumentsTabComponent>;
  let component: DocumentsTabComponent;
  let documentsTab: EntityDocumentsTabComponent;
  let clientsService: { deleteClientDocument: jest.Mock };
  let alertService: { alert: jest.Mock };
  let dialog: { open: jest.Mock };

  const clientDocuments = () => [
    { id: 11, name: 'passport.pdf', fileName: 'passport.pdf', description: 'Identity' },
    { id: 12, name: 'utility.png', fileName: 'utility.png', description: 'Address' }
  ];

  function createComponent(documents: any[]): void {
    const route = {
      data: of({ clientDocuments: documents }),
      parent: { snapshot: { paramMap: convertToParamMap({ clientId: '42' }) } }
    };

    TestBed.configureTestingModule({
      imports: [
        DocumentsTabComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: ClientsService, useValue: clientsService },
        { provide: MatDialog, useValue: dialog },
        { provide: AlertService, useValue: alertService },
        { provide: LoansService, useValue: {} },
        { provide: SavingsService, useValue: {} },
        {
          provide: SettingsService,
          useValue: { serverUrl: 'https://server', dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        {
          provide: DocumentPreviewService,
          useValue: { isPreviewable: jest.fn(() => false), release: jest.fn() }
        },
        { provide: SpreadsheetPreviewService, useValue: { load: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } }
      ]
    });

    TestBed.inject(FaIconLibrary).addIcons(faDownload, faEye, faFile, faPlus, faTimes);

    fixture = TestBed.createComponent(DocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    documentsTab = fixture.debugElement.query(By.directive(EntityDocumentsTabComponent)).componentInstance;
  }

  beforeEach(() => {
    clientsService = { deleteClientDocument: jest.fn(() => of({})) };
    alertService = { alert: jest.fn() };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of({ delete: true }) })) };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.restoreAllMocks();
  });

  it('deletes the selected client document with the client id and removes only that document', () => {
    const documents = clientDocuments();
    createComponent(documents);
    const deleteRequest = new Subject<any>();
    clientsService.deleteClientDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(11, 'passport.pdf');

    expect(clientsService.deleteClientDocument).toHaveBeenCalledWith('42', 11);
    // The document stays visible until the server confirms.
    expect(component.entityDocuments.map((document: any) => document.id)).toEqual([
      11,
      12
    ]);

    deleteRequest.next({});
    deleteRequest.complete();

    expect(component.entityDocuments).toEqual([expect.objectContaining({ id: 12, name: 'utility.png' })]);
    expect(alertService.alert).toHaveBeenCalledWith({
      type: 'success',
      message: 'labels.messages.documentDeleted'
    });
  });

  it('keeps the client document and announces nothing when the delete fails', () => {
    createComponent(clientDocuments());
    const deleteRequest = new Subject<any>();
    clientsService.deleteClientDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(11, 'passport.pdf');
    deleteRequest.error(new Error('delete failed'));

    expect(component.entityDocuments.map((document: any) => document.id)).toEqual([
      11,
      12
    ]);
    expect(alertService.alert).not.toHaveBeenCalled();
  });

  it('does not send a second delete request while one is pending', () => {
    createComponent(clientDocuments());
    const deleteRequest = new Subject<any>();
    clientsService.deleteClientDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(11, 'passport.pdf');
    documentsTab.deleteDocument(11, 'passport.pdf');

    expect(clientsService.deleteClientDocument).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });
});
