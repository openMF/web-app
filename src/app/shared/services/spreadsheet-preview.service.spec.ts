/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as ExcelJS from 'exceljs';

import { MAX_PREVIEW_COLUMNS, MAX_PREVIEW_ROWS, SpreadsheetPreviewService } from './spreadsheet-preview.service';

// Resolve exceljs the way the browser build does. Its package `main` is the Node entry, which drags
// in ESM dependencies Jest will not transform; the `browser` field points at this prebuilt bundle,
// so redirecting here both fixes the import and exercises what actually ships. This covers the
// service's own dynamic import too, since the redirect applies to the whole module registry.
jest.mock('exceljs', () => require('exceljs/dist/exceljs.min.js'));

/** jsdom's Blob does not implement arrayBuffer()/text() reliably, so feed the service a stand-in. */
function blobOf(data: string | ArrayBuffer | Uint8Array, type = ''): Blob {
  return {
    type,
    text: async () => (typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer).toString('utf8')),
    arrayBuffer: async () => (typeof data === 'string' ? Buffer.from(data, 'utf8') : data)
  } as unknown as Blob;
}

/**
 * Assemble a ZIP archive from text entries, stored uncompressed. Enough to hand the reader a
 * package this test controls byte for byte, without pulling in a zip library.
 */
function zipOf(entries: Record<string, string>): Uint8Array {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return c >>> 0;
  });
  const crc32 = (bytes: Buffer): number => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const [
    name,
    content
  ] of Object.entries(entries)) {
    const nameBytes = Buffer.from(name, 'utf8');
    const data = Buffer.from(content, 'utf8');
    const crc = crc32(data);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    local.push(header, nameBytes, data);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBytes.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes);

    offset += header.length + nameBytes.length + data.length;
  }

  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  // A plain Uint8Array, not a Node Buffer: that is what the reader hands around in the browser, and
  // the zip layer under it only recognises the former once jsdom is the environment.
  return new Uint8Array(
    Buffer.concat([
      ...local,
      directory,
      end
    ])
  );
}

async function xlsxOf(build: (workbook: ExcelJS.Workbook) => void): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  build(workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  return blobOf(buffer as ArrayBuffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

describe('SpreadsheetPreviewService', () => {
  let service: SpreadsheetPreviewService;

  beforeEach(() => {
    service = new SpreadsheetPreviewService();
  });

  describe('csv', () => {
    it('parses rows and columns', async () => {
      const preview = await service.load(blobOf('Client,Amount\nAisha,1200\nBob,900'), 'ledger.csv');

      expect(preview.sheets).toHaveLength(1);
      expect(preview.sheets[0].rows).toEqual([
        [
          'Client',
          'Amount'
        ],
        [
          'Aisha',
          '1200'
        ],
        [
          'Bob',
          '900'
        ]
      ]);
      expect(preview.truncated).toBe(false);
    });

    it('keeps delimiters, line breaks and escaped quotes inside a quoted field', async () => {
      const preview = await service.load(blobOf('"Smith, John","says ""hi""","line one\nline two"'), 'notes.csv');

      expect(preview.sheets[0].rows).toEqual([
        [
          'Smith, John',
          'says "hi"',
          'line one\nline two'
        ]
      ]);
    });

    it('handles CRLF line endings without inventing blank rows', async () => {
      const preview = await service.load(blobOf('a,b\r\nc,d\r\n'), 'windows.csv');

      expect(preview.sheets[0].rows).toEqual([
        [
          'a',
          'b'
        ],
        [
          'c',
          'd'
        ]
      ]);
    });

    it('strips a byte order mark from the first cell', async () => {
      const preview = await service.load(blobOf('﻿Client,Amount'), 'bom.csv');

      expect(preview.sheets[0].rows[0][0]).toBe('Client');
    });

    it('detects a semicolon-delimited file', async () => {
      const preview = await service.load(blobOf('Client;Amount\nAisha;1200'), 'euro.csv');

      expect(preview.sheets[0].rows[1]).toEqual([
        'Aisha',
        '1200'
      ]);
    });

    it('reports truncation and clips to the caps', async () => {
      const rows = Array.from({ length: MAX_PREVIEW_ROWS + 10 }, (_, i) => `r${i}`).join('\n');
      const preview = await service.load(blobOf(rows), 'long.csv');

      expect(preview.sheets[0].rows).toHaveLength(MAX_PREVIEW_ROWS);
      expect(preview.sheets[0].hiddenRows).toBe(10);
      expect(preview.truncated).toBe(true);
    });

    it('clips columns beyond the cap', async () => {
      const wide = Array.from({ length: MAX_PREVIEW_COLUMNS + 5 }, (_, i) => `c${i}`).join(',');
      const preview = await service.load(blobOf(wide), 'wide.csv');

      expect(preview.sheets[0].rows[0]).toHaveLength(MAX_PREVIEW_COLUMNS);
      expect(preview.sheets[0].hiddenColumns).toBe(5);
      expect(preview.truncated).toBe(true);
    });

    it('treats a csv content type as csv when the name carries no extension', async () => {
      const preview = await service.load(blobOf('a,b', 'text/csv'), 'attachment');

      expect(preview.sheets[0].rows).toEqual([
        [
          'a',
          'b'
        ]
      ]);
    });
  });

  describe('xlsx', () => {
    it('reads every sheet without the reader’s 1-based index leaking a leading column', async () => {
      const blob = await xlsxOf((workbook) => {
        const balances = workbook.addWorksheet('Balances');
        balances.addRow([
          'Client',
          'Amount'
        ]);
        balances.addRow([
          'Aisha',
          1200.5
        ]);
        workbook.addWorksheet('Notes').addRow(['second sheet']);
      });

      const preview = await service.load(blob, 'book.xlsx');

      expect(preview.sheets.map((sheet) => sheet.name)).toEqual([
        'Balances',
        'Notes'
      ]);
      expect(preview.sheets[0].rows).toEqual([
        [
          'Client',
          'Amount'
        ],
        [
          'Aisha',
          '1200.5'
        ]
      ]);
      expect(preview.sheets[1].rows).toEqual([['second sheet']]);
    });

    it('shows a formula’s cached result rather than its definition', async () => {
      const blob = await xlsxOf((workbook) => {
        const sheet = workbook.addWorksheet('Totals');
        sheet.getCell('A1').value = { formula: 'SUM(B1:B2)', result: 2100.5 } as any;
      });

      const preview = await service.load(blob, 'totals.xlsx');

      expect(preview.sheets[0].rows[0][0]).toBe('2100.5');
    });

    it('renders dates, booleans, rich text and errors as readable text', async () => {
      const blob = await xlsxOf((workbook) => {
        const sheet = workbook.addWorksheet('Mixed');
        sheet.getCell('A1').value = new Date('2026-01-15T00:00:00Z');
        sheet.getCell('B1').value = true;
        sheet.getCell('C1').value = {
          richText: [
            { text: 'bold' },
            { text: ' plain' }
          ]
        } as any;
        sheet.getCell('D1').value = { error: '#REF!' } as any;
      });

      const preview = await service.load(blob, 'mixed.xlsx');

      expect(preview.sheets[0].rows[0]).toEqual([
        '2026-01-15',
        'true',
        'bold plain',
        '#REF!'
      ]);
    });

    it('drops the empty rows that trail a sheet', async () => {
      const blob = await xlsxOf((workbook) => {
        const sheet = workbook.addWorksheet('Sparse');
        sheet.addRow(['only row']);
        sheet.getCell('A6').value = null;
      });

      const preview = await service.load(blob, 'sparse.xlsx');

      expect(preview.sheets[0].rows).toEqual([['only row']]);
      expect(preview.truncated).toBe(false);
    });

    it('reports an empty sheet as having no rows rather than failing', async () => {
      const blob = await xlsxOf((workbook) => workbook.addWorksheet('Empty'));

      const preview = await service.load(blob, 'empty.xlsx');

      expect(preview.sheets[0].rows).toEqual([]);
    });

    /**
     * A hand-built xlsx package whose only worksheet points at a comment part that is not in the
     * file — the shape real-world spreadsheets hit the reader with, and which used to fail the
     * whole preview with "Cannot read properties of undefined (reading 'comments')".
     *
     * It is assembled here rather than written by the library because the library only ever
     * produces self-consistent packages, which is precisely why this case escaped the other tests.
     */
    function xlsxWithDanglingCommentRel(): Blob {
      const sheet =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
        '<row r="1"><c r="A1" t="inlineStr"><is><t>Client</t></is></c>' +
        '<c r="B1" t="inlineStr"><is><t>Amount</t></is></c></row>' +
        '<row r="2"><c r="A2" t="inlineStr"><is><t>Aisha</t></is></c><c r="B2"><v>1200</v></c></row>' +
        '</sheetData></worksheet>';

      return blobOf(
        zipOf({
          '[Content_Types].xml':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
            '</Types>',
          '_rels/.rels':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
            '</Relationships>',
          'xl/workbook.xml':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            '<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>',
          'xl/_rels/workbook.xml.rels':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
            '</Relationships>',
          'xl/worksheets/sheet1.xml': sheet,
          'xl/worksheets/_rels/sheet1.xml.rels':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="../comments1.xml"/>' +
            '<Relationship Id="rId98" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing" Target="../drawings/vmlDrawing1.vml"/>' +
            '</Relationships>'
        })
      );
    }

    it('reads a workbook whose sheets point at a comment part that is not there', async () => {
      const preview = await service.load(xlsxWithDanglingCommentRel(), 'commented.xlsx');

      expect(preview.sheets[0].rows).toEqual([
        [
          'Client',
          'Amount'
        ],
        [
          'Aisha',
          '1200'
        ]
      ]);
    });

    it('prefers the xlsx reader over csv parsing when the extension says xlsx', async () => {
      // Some servers serve attachments as a csv content type; the extension has to win.
      const blob = await xlsxOf((workbook) => workbook.addWorksheet('S').addRow(['real xlsx']));
      (blob as any).type = 'text/csv';

      const preview = await service.load(blob, 'mislabelled.xlsx');

      expect(preview.sheets[0].rows).toEqual([['real xlsx']]);
    });
  });
});
