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

import { SavingsDocumentsTabComponent } from './savings-documents-tab.component';
import { EntityDocumentsTabComponent } from 'app/shared/tabs/entity-documents-tab/entity-documents-tab.component';
import { SavingsService } from 'app/savings/savings.service';
import { LoansService } from 'app/loans/loans.service';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';

describe('SavingsDocumentsTabComponent', () => {
  let fixture: ComponentFixture<SavingsDocumentsTabComponent>;
  let component: SavingsDocumentsTabComponent;
  let documentsTab: EntityDocumentsTabComponent;
  let savingsService: { deleteSavingsDocument: jest.Mock };
  let alertService: { alert: jest.Mock };
  let dialog: { open: jest.Mock };

  const savingsDocuments = () => [
    { id: 21, name: 'statement.pdf', fileName: 'statement.pdf', parentEntityId: 7 },
    { id: 22, name: 'receipt.png', fileName: 'receipt.png', parentEntityId: 7 }
  ];

  function createComponent(documents: any[]): void {
    const route = {
      data: of({ savingsDocuments: documents }),
      parent: { snapshot: { paramMap: convertToParamMap({ savingAccountId: '7' }) } }
    };

    TestBed.configureTestingModule({
      imports: [
        SavingsDocumentsTabComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: SavingsService, useValue: savingsService },
        { provide: MatDialog, useValue: dialog },
        { provide: AlertService, useValue: alertService },
        { provide: LoansService, useValue: {} },
        { provide: ClientsService, useValue: {} },
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

    fixture = TestBed.createComponent(SavingsDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    documentsTab = fixture.debugElement.query(By.directive(EntityDocumentsTabComponent)).componentInstance;
  }

  beforeEach(() => {
    savingsService = { deleteSavingsDocument: jest.fn(() => of({})) };
    alertService = { alert: jest.fn() };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of({ delete: true }) })) };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.restoreAllMocks();
  });

  it('deletes the selected savings document with the account id and removes only that document', () => {
    createComponent(savingsDocuments());
    const deleteRequest = new Subject<any>();
    savingsService.deleteSavingsDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(21, 'statement.pdf');

    expect(savingsService.deleteSavingsDocument).toHaveBeenCalledWith('7', 21);
    // The document stays visible until the server confirms.
    expect(component.entityDocuments.map((document: any) => document.id)).toEqual([
      21,
      22
    ]);

    deleteRequest.next({});
    deleteRequest.complete();

    expect(component.entityDocuments).toEqual([expect.objectContaining({ id: 22, name: 'receipt.png' })]);
    expect(alertService.alert).toHaveBeenCalledWith({
      type: 'success',
      message: 'labels.messages.documentDeleted'
    });
  });

  it('keeps the savings document and announces nothing when the delete fails', () => {
    createComponent(savingsDocuments());
    const deleteRequest = new Subject<any>();
    savingsService.deleteSavingsDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(21, 'statement.pdf');
    deleteRequest.error(new Error('delete failed'));

    expect(component.entityDocuments.map((document: any) => document.id)).toEqual([
      21,
      22
    ]);
    expect(alertService.alert).not.toHaveBeenCalled();
  });

  it('does not send a second delete request while one is pending', () => {
    createComponent(savingsDocuments());
    const deleteRequest = new Subject<any>();
    savingsService.deleteSavingsDocument.mockReturnValue(deleteRequest.asObservable());

    documentsTab.deleteDocument(21, 'statement.pdf');
    documentsTab.deleteDocument(21, 'statement.pdf');

    expect(savingsService.deleteSavingsDocument).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledTimes(1);
  });
});
