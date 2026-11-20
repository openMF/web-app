/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { SpreadsheetPreviewService } from 'app/shared/services/spreadsheet-preview.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { LoanDocumentPreviewDialogComponent } from './loan-document-preview-dialog.component';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { presentDocument } from './loan-document-presentation.utils';
describe('loan document preview', () => {
  let media: any;
  let spreadsheets: any;
  let previews: any;
  let data: any;
  beforeEach(async () => {
    spreadsheets = {
      load: jest.fn(() =>
        Promise.resolve({ sheets: [{ name: 'CSV', rows: [['Synthetic CSV cell']] }], truncated: false })
      )
    };
    media = { read: jest.fn(() => Promise.resolve(new Blob(['synthetic'], { type: 'application/octet-stream' }))) };
    const classifier = new DocumentPreviewService();
    previews = {
      getPreviewType: jest.fn((document: any) => classifier.getPreviewType(document)),
      resolvePreviewUrl: jest.fn(() => Promise.resolve({ url: 'blob:synthetic', type: 'pdf' })),
      release: jest.fn()
    };
    data = { loanId: '42', document: presentDocument({ id: 7, fileName: 'synthetic.pdf' }) };
    await TestBed.configureTestingModule({
      imports: [
        LoanDocumentPreviewDialogComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: SpreadsheetPreviewService, useValue: spreadsheets },
        { provide: LoanDocumentMediaService, useValue: media },
        { provide: DocumentPreviewService, useValue: previews }
      ]
    }).compileComponents();
  });
  it('reuses authenticated reads and the existing PDF preview service with a scoped key', async () => {
    const fixture = TestBed.createComponent(LoanDocumentPreviewDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    expect(media.read).toHaveBeenCalledWith('42', data.document);
    expect(previews.resolvePreviewUrl).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'loan:42:7' }),
      expect.any(Function)
    );
    expect(fixture.componentInstance.pdfUrl).toBeTruthy();
    fixture.destroy();
    expect(previews.release).toHaveBeenCalledWith('loan:42:7');
  });
  it('reports a failed preview without a broken iframe', async () => {
    media.read.mockRejectedValue(new Error('damaged'));
    const fixture = TestBed.createComponent(LoanDocumentPreviewDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    expect(fixture.componentInstance.failed).toBe(true);
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
    fixture.destroy();
  });
  it('uses a privacy-safe generic alt for image previews', async () => {
    data.document = presentDocument({ id: 7, fileName: 'TEST900101HDFXXX09-01-IDENTIDAD.jpg' });
    previews.resolvePreviewUrl.mockResolvedValue({ url: 'blob:synthetic', type: 'image' });
    const fixture = TestBed.createComponent(LoanDocumentPreviewDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').alt).not.toContain('TEST900101');
    fixture.destroy();
  });
  it('reuses the upstream spreadsheet reader for existing CSV attachments', async () => {
    data.document = presentDocument({ id: 7, fileName: 'synthetic.csv' });
    const fixture = TestBed.createComponent(LoanDocumentPreviewDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    expect(spreadsheets.load).toHaveBeenCalledWith(expect.any(Blob), 'synthetic.csv');
    expect(fixture.componentInstance.sheets[0].rows[0][0]).toBe('Synthetic CSV cell');
    fixture.destroy();
  });
  it.each([
    'csv',
    'xlsx'
  ])('dispatches %s by the shared classifier despite conflicting PDF metadata', async (extension) => {
    data.document = presentDocument({ id: 7, fileName: `ledger.${extension}`, type: 'application/pdf' });
    expect(data.document.extension).toBe('PDF');
    const fixture = TestBed.createComponent(LoanDocumentPreviewDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await Promise.resolve();
    expect(previews.getPreviewType).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: `ledger.${extension}`, mimeType: 'application/pdf' })
    );
    expect(spreadsheets.load).toHaveBeenCalledWith(expect.any(Blob), `ledger.${extension}`);
    expect(previews.resolvePreviewUrl).not.toHaveBeenCalled();
    expect(fixture.componentInstance.failed).toBe(false);
    fixture.destroy();
  });
});
