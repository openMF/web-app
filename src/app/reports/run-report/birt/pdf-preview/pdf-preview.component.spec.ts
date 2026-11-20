/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PdfPreviewComponent } from './pdf-preview.component';

jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(),
  GlobalWorkerOptions: { workerSrc: '' }
}));

describe('PdfPreviewComponent', () => {
  let fixture: ComponentFixture<PdfPreviewComponent>;
  let render: jest.Mock;
  let getPage: jest.Mock;
  let cancel: jest.Mock;
  let destroy: jest.Mock;
  let pageWidth: number;

  beforeEach(async () => {
    pageWidth = 600;
    cancel = jest.fn();
    destroy = jest.fn(() => Promise.resolve());
    render = jest.fn(() => ({ promise: Promise.resolve(), cancel }));
    getPage = jest.fn(() =>
      Promise.resolve({
        getViewport: ({ scale }: { scale: number }) => ({ width: pageWidth * scale, height: 800 * scale }),
        render,
        getTextContent: jest.fn(() => Promise.resolve({ items: [{ str: 'Loan statement' }] }))
      })
    );
    (getDocument as jest.Mock).mockReturnValue({
      promise: Promise.resolve({ numPages: 2, getPage, destroy }),
      destroy
    });
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    await TestBed.configureTestingModule({ imports: [
        PdfPreviewComponent,
        TranslateModule.forRoot()
      ] }).compileComponents();
    fixture = TestBed.createComponent(PdfPreviewComponent);
    fixture.componentRef.setInput(
      'data',
      new Uint8Array([
        37,
        80,
        68,
        70
      ]).buffer
    );
  });

  afterEach(() => {
    fixture.destroy();
    jest.restoreAllMocks();
  });

  async function load(): Promise<void> {
    const lifecycle = jest.spyOn(
      fixture.componentInstance as unknown as { loadDocument(): Promise<void> },
      'loadDocument'
    );
    fixture.detectChanges();
    // Await the complete lifecycle, including the native import and PDF.js promises.
    await lifecycle.mock.results.at(-1)?.value;
    lifecycle.mockRestore();
    fixture.detectChanges();
  }

  async function renderAction(action: () => void): Promise<void> {
    const rendering = jest.spyOn(fixture.componentInstance as unknown as { renderPage(): Promise<void> }, 'renderPage');
    action();
    await Promise.all(rendering.mock.results.map((result) => result.value));
    rendering.mockRestore();
    fixture.detectChanges();
  }

  it('loads a bundled worker and renders document bytes without a PDF browser plugin', async () => {
    await load();
    expect(fixture.componentInstance.totalPages).toBe(2);
    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.failed).toBe(false);
    expect(GlobalWorkerOptions.workerSrc).toContain('/assets/pdfjs/pdf.worker.min.mjs');
    expect(getPage).toHaveBeenCalledWith(1);
    expect(render).toHaveBeenCalled();
    expect(fixture.componentInstance.pageText).toBe('Loan statement');
    expect(fixture.nativeElement.querySelector('canvas').hidden).toBe(false);
  });

  it('keeps the input buffer intact for downloads and later renders', async () => {
    await load();
    const options = (getDocument as jest.Mock).mock.calls.at(-1)[0];
    expect(options.data.buffer).not.toBe(fixture.componentInstance.data);
    expect(options.isEvalSupported).toBe(false);
    expect(options.enableXfa).toBe(false);
    expect(options.cMapUrl).toContain('/assets/pdfjs/cmaps/');
    expect(options.cMapPacked).toBe(true);
    expect(fixture.componentInstance.data.byteLength).toBe(4);
  });

  it('navigates and zooms without requesting the report again', async () => {
    await load();
    const calls = (getDocument as jest.Mock).mock.calls.length;
    const pages = fixture.nativeElement.querySelector('.pdf-pages');
    pages.scrollTop = 220;
    await renderAction(() => fixture.componentInstance.next());
    expect(pages.scrollTop).toBe(0);
    expect(getPage).toHaveBeenLastCalledWith(2);
    fixture.componentInstance.next();
    expect(fixture.componentInstance.pageNumber).toBe(2);
    pages.scrollTop = 220;
    await renderAction(() => fixture.componentInstance.previous());
    expect(pages.scrollTop).toBe(0);
    expect(getPage).toHaveBeenLastCalledWith(1);
    await renderAction(() => fixture.componentInstance.zoom(0.2));
    expect((getDocument as jest.Mock).mock.calls.length).toBe(calls);
  });

  it('accumulates zoom clicks before rendering completes', async () => {
    await load();
    const initialWidth = fixture.nativeElement.querySelector('canvas').width;
    await renderAction(() => {
      fixture.componentInstance.zoom(0.2);
      fixture.componentInstance.zoom(0.2);
    });
    expect(render.mock.calls.at(-1)[0].viewport.width).toBeCloseTo(initialWidth + pageWidth * 0.4);
  });

  it('fits wide pages into narrow containers below the manual zoom minimum', async () => {
    await load();
    pageWidth = 1600;
    Object.defineProperty(fixture.nativeElement.querySelector('.pdf-pages'), 'clientWidth', { value: 320 });
    await renderAction(() => fixture.componentInstance.fit());
    expect(fixture.nativeElement.querySelector('canvas').style.width).toBe('288px');
    await renderAction(() => fixture.componentInstance.zoom(-4));
    expect(fixture.nativeElement.querySelector('canvas').style.width).toBe('288px');
    await renderAction(() => fixture.componentInstance.zoom(0.2));
    expect(fixture.nativeElement.querySelector('canvas').style.width).toBe('608px');
  });

  it('destroys the previous loading task when the document changes', async () => {
    await load();
    fixture.componentRef.setInput(
      'data',
      new Uint8Array([
        37,
        80,
        68,
        70,
        45
      ]).buffer
    );
    await load();
    expect(destroy).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
    expect(fixture.componentInstance.pageNumber).toBe(1);
  });

  it('shows a recoverable preview error instead of a blank frame', async () => {
    (getDocument as jest.Mock).mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('Invalid PDF')),
      destroy
    }));
    await load();
    expect(fixture.componentInstance.failed).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('reports.pdf.unavailable');
    expect(fixture.nativeElement.querySelector('canvas').hidden).toBe(true);
    expect(fixture.componentInstance.documentFailed).toBe(true);
    expect(fixture.componentInstance.documentLoaded).toBe(false);
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('button')).every((button: HTMLButtonElement) => button.disabled)
    ).toBe(true);
  });

  it('keeps recovery controls available after a page fails and returns to the previous page', async () => {
    await load();
    render.mockImplementationOnce(() => ({ promise: Promise.reject(new Error('Page render failed')), cancel }));
    await renderAction(() => fixture.componentInstance.next());
    expect(fixture.componentInstance.pageNumber).toBe(2);
    expect(fixture.componentInstance.pageRenderFailed).toBe(true);
    expect(fixture.componentInstance.documentFailed).toBe(false);
    expect(fixture.componentInstance.documentLoaded).toBe(true);
    expect(fixture.componentInstance.pageText).toBe('');
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons[0].disabled).toBe(false);
    expect(buttons.slice(2).every((button) => !button.disabled)).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    await renderAction(() => buttons[0].click());
    expect(getPage).toHaveBeenLastCalledWith(1);
    expect(fixture.componentInstance.failed).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('canvas').hidden).toBe(false);
  });
});
