/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { downloadBlob } from 'app/core/utils/file-download.utils';
import { DepositReceiptExportService, receiptPageSlices } from './deposit-receipt-export.service';

let renderedNode: HTMLElement | null = null;
let renderedHeight = 500;
const addImage = jest.fn();
const drawImage = jest.fn();
const addPage = jest.fn();
const output = jest.fn(() => new Blob(['%PDF-receipt'], { type: 'application/pdf' }));
jest.mock('jspdf', () => ({ jsPDF: jest.fn().mockImplementation(() => ({ addImage, addPage, output })) }));
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn((node: HTMLElement) => {
    renderedNode = node;
    return Promise.resolve({ width: 1280, height: renderedHeight });
  })
}));
jest.mock('app/core/utils/file-download.utils', () => ({ downloadBlob: jest.fn() }));

describe('DepositReceiptExportService', () => {
  let service: DepositReceiptExportService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepositReceiptExportService);
    renderedNode = null;
    renderedHeight = 500;
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const top = this.className === 'deposit-export-row' ? 200 : 0;
      const height =
        this.className === 'deposit-export-row' ? Math.max(20, renderedHeight / 2 - 232) : renderedHeight / 2;
      return { x: 0, y: top, top, left: 0, right: 640, bottom: top + height, width: 640, height, toJSON: () => ({}) };
    });
    jest.spyOn(document, 'createRange').mockReturnValue({
      selectNodeContents: (): void => undefined,
      getClientRects: () =>
        Array.from({ length: 105 }, (_, index) => ({ top: 230 + index * 26, bottom: 248 + index * 26, height: 18 }))
    } as unknown as Range);
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage })) as never;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,slice') as never;
  });

  it('renders genuine Unicode receipt fields as text and removes the export page', async () => {
    const before = document.body.children.length;
    await service.download(
      'Recibo de pago',
      '$1,000.00 MXN',
      [
        { label: 'Cliente', value: 'María Test नेपाली 한국어' },
        { label: 'Referencia', value: '<img src=x onerror=alert(1)>' },
        { label: 'ID', value: '9223372036854775807' }
      ],
      '9223372036854775807'
    );
    expect(renderedNode?.textContent).toContain('María Test नेपाली 한국어');
    expect(renderedNode?.textContent).toContain('9223372036854775807');
    expect(renderedNode?.querySelector('img')).toBeNull();
    expect(document.body.children.length).toBe(before);
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'deposit-9223372036854775807.pdf');
  });

  it('paginates long receipts instead of clipping fields', async () => {
    renderedHeight = 6000;
    await service.download('Receipt', '$10.00', [{ label: 'Note', value: 'Long note' }], '101');
    expect(addPage).toHaveBeenCalledTimes(3);
    expect(addImage).toHaveBeenCalledTimes(4);
    const pageEnds = drawImage.mock.calls.slice(0, -1).map((args) => Number(args[2]) + Number(args[4]));
    // Fixture lines have ink through y=248, next line starts at y=256 (canvas scale 2).
    // Every internal page cut must be strictly inside that whitespace, never on a glyph edge.
    for (const end of pageEnds) {
      expect((end - 496) % 52).toBeGreaterThan(0);
      expect((end - 496) % 52).toBeLessThan(16);
    }
  });

  it('removes the temporary receipt when PDF rendering fails', async () => {
    const before = document.body.children.length;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => {
      throw new Error('Canvas failed');
    }) as never;
    await expect(service.download('Receipt', '$10.00', [], '101')).rejects.toThrow('Canvas failed');
    expect(document.body.children.length).toBe(before);
    expect(downloadBlob).not.toHaveBeenCalled();
  });
  it('moves a complete row to the next page rather than cutting through its text', () => {
    expect(
      receiptPageSlices(1400, 1000, [
        { top: 180, bottom: 750, lines: [] },
        { top: 750, bottom: 1100, lines: [
            850,
            950,
            1050
          ] },
        { top: 1100, bottom: 1360, lines: [] }
      ])
    ).toEqual([
      { top: 0, height: 750 },
      { top: 750, height: 650 }
    ]);
  });

  it('splits a multi-page wrapped note only after measured lines, leaving no omitted pixels', () => {
    const lines = [
      300,
      600,
      900,
      1200,
      1500,
      1800,
      2100,
      2400
    ];
    const slices = receiptPageSlices(2600, 1000, [{ top: 180, bottom: 2500, lines }]);
    expect(slices).toEqual([
      { top: 0, height: 900 },
      { top: 900, height: 900 },
      { top: 1800, height: 800 }
    ]);
    expect(slices.reduce((sum, slice) => sum + slice.height, 0)).toBe(2600);
  });

  it('keeps a short receipt on one page and fails safely when no text boundary fits', () => {
    expect(receiptPageSlices(500, 1000, [])).toEqual([{ top: 0, height: 500 }]);
    expect(receiptPageSlices(1050, 1000, [{ top: 180, bottom: 950, lines: [] }])).toEqual([{ top: 0, height: 1000 }]);
    expect(() => receiptPageSlices(2000, 1000, [])).toThrow('No safe receipt page break');
  });
  it('uses rounded row span to allow safe line breaks at fractional canvas coordinates', () => {
    expect(
      receiptPageSlices(1400, 1000, [{ top: 180.25, bottom: 1180.25, lines: [
            500,
            900,
            1100
          ] }])
    ).toEqual([
      { top: 0, height: 900 },
      { top: 900, height: 500 }
    ]);
    expect(
      receiptPageSlices(1400, 1000, [{ top: 180.25, bottom: 1179.25, lines: [
            500,
            900
          ] }])
    ).toEqual([
      { top: 0, height: 180 },
      { top: 180, height: 1000 }
    ]);
    expect(() => receiptPageSlices(1400, 1000, [{ top: 180.25, bottom: 1180.25, lines: [] }])).toThrow(
      'No safe receipt page break'
    );
  });
});
