/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { getDocument } from 'pdfjs-dist';
import { LoansService } from 'app/loans/loans.service';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { LoanDocumentThumbnailComponent } from './loan-document-thumbnail.component';
import { presentDocument } from './loan-document-presentation.utils';

jest.mock('pdfjs-dist', () => ({ getDocument: jest.fn(), GlobalWorkerOptions: { workerSrc: '' } }));

describe('retained loan document thumbnails', () => {
  let fixture: ComponentFixture<LoanDocumentThumbnailComponent>;
  let media: LoanDocumentMediaService;
  let firstRead: Subject<Blob>;
  let secondRead: Subject<Blob>;
  let loans: any;
  const originalCreateUrl = URL.createObjectURL;
  const originalRevokeUrl = URL.revokeObjectURL;
  const originalDecode = HTMLImageElement.prototype.decode;
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
  beforeEach(async () => {
    firstRead = new Subject<Blob>();
    secondRead = new Subject<Blob>();
    loans = { downloadLoanDocument: jest.fn().mockReturnValueOnce(firstRead).mockReturnValueOnce(secondRead) };
    URL.createObjectURL = jest.fn(() => 'blob:synthetic');
    URL.revokeObjectURL = jest.fn();
    HTMLImageElement.prototype.decode = jest.fn(() => Promise.resolve());
    jest.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(480);
    jest.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(640);
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: jest.fn() } as any);
    jest.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,c3ludGhldGlj');
    await TestBed.configureTestingModule({
      imports: [
        LoanDocumentThumbnailComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        LoanDocumentMediaService,
        { provide: LoansService, useValue: loans },
        { provide: DocumentPreviewService, useValue: { clear: jest.fn() } }
      ]
    }).compileComponents();
    media = TestBed.inject(LoanDocumentMediaService);
    fixture = TestBed.createComponent(LoanDocumentThumbnailComponent);
    fixture.componentRef.setInput('document', presentDocument({ id: 7, fileName: 'synthetic.png' }));
    fixture.componentRef.setInput('loanId', '42');
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture.destroy();
    jest.restoreAllMocks();
    URL.createObjectURL = originalCreateUrl;
    URL.revokeObjectURL = originalRevokeUrl;
    HTMLImageElement.prototype.decode = originalDecode;
  });
  it('restarts a cancelled read when the refreshed collection retains the same component and document ID', async () => {
    const retained = fixture.componentInstance;
    expect(firstRead.observed).toBe(true);
    media.invalidate();
    expect(firstRead.observed).toBe(false);
    fixture.componentRef.setInput(
      'document',
      presentDocument({ id: 7, fileName: 'synthetic.png', name: 'Refreshed title' })
    );
    fixture.detectChanges();
    secondRead.next(new Blob(['synthetic'], { type: 'image/png' }));
    secondRead.complete();
    await settle();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBe(retained);
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(2);
    expect(retained.url).toBe('data:image/jpeg;base64,c3ludGhldGlj');
    expect(retained.loading).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:synthetic');
  });
  it('keeps removed thumbnails cancelled rather than restarting them', async () => {
    media.invalidate();
    fixture.destroy();
    await settle();
    expect(firstRead.observed).toBe(false);
    expect(loans.downloadLoanDocument).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('uses the new loan ID after route invalidation without publishing the old read', async () => {
    media.invalidate();
    fixture.componentRef.setInput('loanId', '43');
    fixture.detectChanges();
    firstRead.next(new Blob(['old']));
    firstRead.complete();
    secondRead.next(new Blob(['new'], { type: 'image/png' }));
    secondRead.complete();
    await settle();
    expect(loans.downloadLoanDocument.mock.calls).toEqual([
      [
        '42',
        '7'
      ],
      [
        '43',
        '7'
      ]
    ]);
    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.url).toBeTruthy();
  });
  it('resolves packed CMaps from the deployed asset base when rendering a PDF', async () => {
    fixture.destroy();
    media.invalidate();
    const base = document.createElement('base');
    base.href = 'https://example.test/web-app/';
    document.head.prepend(base);
    const task = {
      promise: Promise.resolve({
        getPage: jest.fn().mockResolvedValue({
          getViewport: () => ({ width: 480, height: 640 }),
          render: () => ({ promise: Promise.resolve(), cancel: jest.fn() })
        })
      }),
      destroy: jest.fn(() => Promise.resolve())
    };
    jest.mocked(getDocument).mockReturnValue(task as any);
    loans.downloadLoanDocument
      .mockReset()
      .mockReturnValue(of({ size: 4, arrayBuffer: async () => new ArrayBuffer(4) } as Blob));
    try {
      fixture = TestBed.createComponent(LoanDocumentThumbnailComponent);
      fixture.componentRef.setInput('document', presentDocument({ id: 8, fileName: 'synthetic.pdf' }));
      fixture.componentRef.setInput('loanId', '42');
      fixture.detectChanges();
      await settle();
      expect(getDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          cMapUrl: 'https://example.test/web-app/assets/pdfjs/cmaps/',
          cMapPacked: true,
          isEvalSupported: false,
          enableXfa: false
        })
      );
      expect(fixture.componentInstance.url).toBeTruthy();
      expect(task.destroy).toHaveBeenCalled();
    } finally {
      base.remove();
    }
  });
});
