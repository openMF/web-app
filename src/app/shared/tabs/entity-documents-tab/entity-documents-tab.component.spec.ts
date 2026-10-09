/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faEye, faFile, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { ClientsService } from 'app/clients/clients.service';
import { downloadBlob } from 'app/core/utils/file-download.utils';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';
import { SpreadsheetPreviewDialogComponent } from 'app/shared/documents/spreadsheet-preview-dialog/spreadsheet-preview-dialog.component';
import { EntityDocumentsTabComponent } from './entity-documents-tab.component';

jest.mock('app/core/utils/file-download.utils', () => ({
  downloadBlob: jest.fn()
}));

/** Let a chain of awaited promises settle — whenStable() does not drain the parse's own chain. */
const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('EntityDocumentsTabComponent', () => {
  let fixture: ComponentFixture<EntityDocumentsTabComponent>;
  let component: EntityDocumentsTabComponent;
  let clientsService: jest.Mocked<ClientsService>;
  let documentPreviewService: jest.Mocked<DocumentPreviewService>;
  let spreadsheetPreviewService: jest.Mocked<SpreadsheetPreviewService>;
  let dialog: jest.Mocked<MatDialog>;
  let alertService: { alert: jest.Mock };

  beforeEach(async () => {
    clientsService = {
      downloadClientDocument: jest.fn()
    } as any;
    dialog = {
      open: jest.fn(() => ({ afterClosed: () => of(null) }))
    } as any;
    alertService = { alert: jest.fn() };
    spreadsheetPreviewService = {
      load: jest.fn(() =>
        Promise.resolve({
          sheets: [
            {
              name: 'Balances',
              rows: [
                [
                  'Client',
                  'Amount'
                ],
                [
                  'Aisha',
                  '1200'
                ]
              ],
              hiddenRows: 0,
              hiddenColumns: 0
            }
          ],
          truncated: false
        })
      )
    } as any;
    documentPreviewService = {
      isPreviewable: jest.fn(() => true),
      getPreviewType: jest.fn(() => 'image'),
      isGalleryPreviewable: jest.fn(() => true),
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
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        DatePipe,
        { provide: DocumentPreviewService, useValue: documentPreviewService },
        { provide: SpreadsheetPreviewService, useValue: spreadsheetPreviewService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        { provide: MatDialog, useValue: dialog },
        { provide: AlertService, useValue: alertService }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faDownload, faEye, faFile, faPlus, faTimes);

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

  it('shows a PDF card as an embedded viewer with the browser chrome switched off', async () => {
    component.entityId = '3616';
    component.entityDocuments = [{ id: 51, name: 'Statement', fileName: 'statement.pdf' }];
    clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['%PDF-1.4'])));
    documentPreviewService.resolvePreviewUrl.mockResolvedValue({ url: 'blob:statement', type: 'pdf' } as never);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const iframe = fixture.nativeElement.querySelector('iframe.pdf-thumb');
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('src')).toBe('blob:statement#toolbar=0&navpanes=0&scrollbar=0&view=FitH');
    // The card, not the viewer, must receive the click that opens the lightbox.
    expect(fixture.nativeElement.querySelector('.thumb.has-pdf')).toBeTruthy();
  });

  it('falls back to the placeholder for file types that cannot be previewed', async () => {
    component.entityDocuments = [{ id: 52, name: 'Ledger', fileName: 'ledger.xlsx' }];
    documentPreviewService.isPreviewable.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('iframe.pdf-thumb')).toBeNull();
    expect(fixture.nativeElement.querySelector('.placeholder')).toBeTruthy();
  });

  it('uploads a document with issuance and expiry dates', () => {
    const file = new File(['content'], 'statement.pdf', { type: 'application/pdf' });
    component.entityDocuments = [];
    component.callbackUpload = jest.fn(() => of({ resourceId: 99 }));
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          fileName: 'statement.pdf',
          description: 'Monthly statement',
          issuanceDate: new Date(2024, 0, 2),
          expiryDate: new Date(2030, 5, 30),
          file
        })
    } as any);

    component.uploadDocument();

    const formData = (component.callbackUpload as jest.Mock).mock.calls[0][0] as FormData;
    expect(formData.get('name')).toBe('statement.pdf');
    expect(formData.get('description')).toBe('Monthly statement');
    expect(formData.get('file')).toBe(file);
    expect(formData.get('dateFormat')).toBe('yyyy-MM-dd');
    expect(formData.get('locale')).toBe('en');
    expect(formData.get('issuanceDate')).toBe('2024-01-02');
    expect(formData.get('expiryDate')).toBe('2030-06-30');
    expect(component.entityDocuments[0]).toEqual(
      expect.objectContaining({
        id: 99,
        issuanceDate: '2024-01-02',
        expiryDate: '2030-06-30'
      })
    );
  });

  it('uploads a document without optional dates', () => {
    const file = new File(['content'], 'receipt.pdf', { type: 'application/pdf' });
    component.entityDocuments = [];
    component.callbackUpload = jest.fn(() => of({ resourceId: 100 }));
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          fileName: 'receipt.pdf',
          description: '',
          issuanceDate: '',
          expiryDate: '',
          file
        })
    } as any);

    component.uploadDocument();

    const formData = (component.callbackUpload as jest.Mock).mock.calls[0][0] as FormData;
    expect(formData.has('issuanceDate')).toBe(false);
    expect(formData.has('expiryDate')).toBe(false);
    expect(formData.get('file')).toBe(file);
  });

  it('saves a document that cannot be previewed under its stored file name', () => {
    component.entityDocuments = [{ id: 52, name: 'Ledger', fileName: 'ledger.xlsx' }];
    documentPreviewService.isPreviewable.mockReturnValue(false);
    const blob = new Blob(['rows'], { type: 'application/vnd.ms-excel' });
    clientsService.downloadClientDocument.mockReturnValue(of(blob) as any);

    fixture.detectChanges();

    const downloadButton: HTMLButtonElement = fixture.nativeElement.querySelector('.actions button[color="primary"]');
    expect(downloadButton).toBeTruthy();
    downloadButton.click();

    expect(clientsService.downloadClientDocument).toHaveBeenCalledWith('3616', 52);
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'ledger.xlsx');
  });

  it('falls back to the document name when the stored file name is missing', () => {
    component.entityDocuments = [{ id: 53, name: 'Ledger' }];
    documentPreviewService.isPreviewable.mockReturnValue(false);
    clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['rows'])) as any);

    component.downloadDocument(component.entityDocuments[0]);

    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'Ledger');
  });

  it('does not request an attachment for an invalid document id', () => {
    component.downloadDocument({ id: -1, name: 'Ledger', fileName: 'ledger.xlsx' });

    expect(clientsService.downloadClientDocument).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('explains that a file type has no preview rather than leaving the card inert', () => {
    component.entityDocuments = [{ id: 54, name: 'Ledger', fileName: 'ledger.xlsx' }];
    documentPreviewService.isPreviewable.mockReturnValue(false);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.placeholder .hint').textContent).toContain('PreviewNotAvailable');
    // A thumbnail that opens nothing must not be announced as a Preview button.
    const thumb: HTMLElement = fixture.nativeElement.querySelector('.thumb');
    expect(thumb.getAttribute('role')).toBeNull();
    expect(thumb.getAttribute('tabindex')).toBeNull();
    expect(thumb.getAttribute('aria-label')).toBeNull();
  });

  it('does not claim a previewable document has no preview while its thumbnail is still loading', () => {
    component.entityDocuments = [{ id: 55, name: 'Statement', fileName: 'statement.pdf' }];
    clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['%PDF-1.4'])) as any);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.placeholder')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.placeholder .hint')).toBeNull();
    expect(fixture.nativeElement.querySelector('.thumb').getAttribute('role')).toBe('button');
  });

  describe('spreadsheet documents', () => {
    const asSpreadsheet = () => {
      documentPreviewService.getPreviewType.mockReturnValue('spreadsheet' as never);
      documentPreviewService.isGalleryPreviewable.mockReturnValue(false);
    };

    it('parses the sheet and shows the first rows on the card', async () => {
      asSpreadsheet();
      component.entityDocuments = [{ id: 60, name: 'Ledger', fileName: 'ledger.xlsx' }];
      const blob = new Blob(['xlsx-bytes']);
      clientsService.downloadClientDocument.mockReturnValue(of(blob) as any);

      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(spreadsheetPreviewService.load).toHaveBeenCalledWith(blob, 'ledger.xlsx');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('table.spreadsheet-thumb td')).map((cell: any) =>
        cell.textContent.trim()
      );
      expect(cells).toEqual([
        'Client',
        'Amount',
        'Aisha',
        '1200'
      ]);
      // A spreadsheet is not a gallery slide, so no image or PDF frame should be built for it.
      expect(documentPreviewService.resolvePreviewUrl).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('iframe.pdf-thumb')).toBeNull();
    });

    it('opens the viewer dialog instead of the lightbox carousel', async () => {
      asSpreadsheet();
      const document = { id: 61, name: 'Ledger', fileName: 'ledger.xlsx' };
      component.entityDocuments = [document];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['xlsx-bytes'])) as any);

      await component.openPreview(document);

      expect(dialog.open).toHaveBeenCalledWith(
        SpreadsheetPreviewDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({ name: 'ledger.xlsx' })
        })
      );
    });

    it('downloads and parses the document only once across the card and the dialog', async () => {
      asSpreadsheet();
      const document = { id: 62, name: 'Ledger', fileName: 'ledger.xlsx' };
      component.entityDocuments = [document];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['xlsx-bytes'])) as any);

      fixture.detectChanges();
      await flushMicrotasks();
      await component.openPreview(document);

      expect(clientsService.downloadClientDocument).toHaveBeenCalledTimes(1);
      expect(spreadsheetPreviewService.load).toHaveBeenCalledTimes(1);
    });

    it('does not open a dialog when the spreadsheet cannot be read', async () => {
      asSpreadsheet();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      const document = { id: 63, name: 'Broken', fileName: 'broken.xlsx' };
      component.entityDocuments = [document];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['bad'])) as any);
      spreadsheetPreviewService.load.mockRejectedValue(new Error('not a spreadsheet') as never);

      await component.openPreview(document);

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('publishes the parsed sheet inside the Angular zone so the view is actually flushed', async () => {
      // The reader arrives through a dynamic import, whose promise zone.js does not patch: work
      // resumed after that await lands outside the zone, where markForCheck() never gets flushed.
      asSpreadsheet();
      const document = { id: 65, name: 'Ledger', fileName: 'ledger.xlsx' };
      component.entityDocuments = [document];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['xlsx-bytes'])) as any);
      const zone = TestBed.inject(NgZone);
      const insideZone: boolean[] = [];
      jest.spyOn(zone, 'run').mockImplementation((fn: any) => {
        insideZone.push(true);
        return fn();
      });

      await component.openPreview(document);

      // Once to publish the parsed grid, once to open the dialog.
      expect(insideZone).toHaveLength(2);
      expect(dialog.open).toHaveBeenCalled();
    });

    it('tells the user when a spreadsheet cannot be read instead of failing silently', async () => {
      asSpreadsheet();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      const document = { id: 66, name: 'Broken', fileName: 'broken.xlsx' };
      component.entityDocuments = [document];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['bad'])) as any);
      spreadsheetPreviewService.load.mockRejectedValue(new Error('not a spreadsheet') as never);

      await component.openPreview(document);

      expect(alertService.alert).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('SpreadsheetPreviewFailed') })
      );
    });

    it('still offers a download for a spreadsheet', async () => {
      asSpreadsheet();
      component.entityDocuments = [{ id: 64, name: 'Ledger', fileName: 'ledger.xlsx' }];
      clientsService.downloadClientDocument.mockReturnValue(of(new Blob(['xlsx-bytes'])) as any);

      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.actions button[color="primary"]')).toBeTruthy();
    });
  });

  it('displays issuance and expiry dates with the date format pipe', () => {
    component.entityDocuments = [
      {
        id: 101,
        name: 'license.pdf',
        fileName: 'license.pdf',
        issuanceDate: '2024-01-02',
        expiryDate: '2030-06-30'
      }
    ];
    documentPreviewService.isPreviewable.mockReturnValue(false);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Issuance Date: 02 January 2024');
    expect(text).toContain('Expiry Date: 30 June 2030');
  });
});
