/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { SpreadsheetPreview } from 'app/shared/services/spreadsheet-preview.service';
import {
  SpreadsheetPreviewDialogComponent,
  SpreadsheetPreviewDialogData
} from './spreadsheet-preview-dialog.component';

function sheet(name: string, rows: string[][]) {
  return { name, rows, hiddenRows: 0, hiddenColumns: 0 };
}

async function render(
  data: SpreadsheetPreviewDialogData
): Promise<ComponentFixture<SpreadsheetPreviewDialogComponent>> {
  await TestBed.configureTestingModule({
    imports: [
      SpreadsheetPreviewDialogComponent,
      NoopAnimationsModule,
      TranslateModule.forRoot()
    ],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close: (): void => undefined } }
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(SpreadsheetPreviewDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('SpreadsheetPreviewDialogComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders the grid with spreadsheet-style row numbers and column letters', async () => {
    const preview: SpreadsheetPreview = {
      sheets: [
        sheet('Balances', [
          [
            'Client',
            'Amount'
          ],
          [
            'Aisha',
            '1200'
          ]
        ])
      ],
      truncated: false
    };

    const fixture = await render({ name: 'ledger.xlsx', preview });
    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th: any) =>
      th.textContent.trim()
    );
    const firstBodyRow = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:first-child th, tbody tr:first-child td')
    ).map((cell: any) => cell.textContent.trim());

    // Leading blank is the corner cell above the row-number gutter.
    expect(headers).toEqual([
      '',
      'A',
      'B'
    ]);
    expect(firstBodyRow).toEqual([
      '1',
      'Client',
      'Amount'
    ]);
  });

  it('pads ragged rows so every row spans the widest one', async () => {
    const preview: SpreadsheetPreview = {
      sheets: [
        sheet('Ragged', [
          [
            'a',
            'b',
            'c'
          ],
          ['only one']
        ])
      ],
      truncated: false
    };

    const fixture = await render({ name: 'ragged.csv', preview });
    const secondRowCells = fixture.nativeElement.querySelectorAll('tbody tr:nth-child(2) td');

    expect(secondRowCells).toHaveLength(3);
    expect(secondRowCells[0].textContent.trim()).toBe('only one');
    expect(secondRowCells[2].textContent.trim()).toBe('');
  });

  it('names columns beyond Z the way a spreadsheet does', async () => {
    const wide = Array.from({ length: 28 }, (_, i) => `c${i}`);
    const fixture = await render({
      name: 'wide.csv',
      preview: { sheets: [sheet('Wide', [wide])], truncated: false }
    });

    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th: any) =>
      th.textContent.trim()
    );

    expect(headers.slice(25, 29)).toEqual([
      'Y',
      'Z',
      'AA',
      'AB'
    ]);
  });

  it('offers a tab per sheet and switches the grid', async () => {
    const preview: SpreadsheetPreview = {
      sheets: [
        sheet('First', [['one']]),
        sheet('Second', [['two']])
      ],
      truncated: false
    };

    const fixture = await render({ name: 'book.xlsx', preview });
    const tabs = fixture.nativeElement.querySelectorAll('.sheet-tab');
    expect(tabs).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('tbody td').textContent.trim()).toBe('one');

    tabs[1].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tbody td').textContent.trim()).toBe('two');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('hides the sheet tabs when there is only one sheet', async () => {
    const fixture = await render({
      name: 'single.csv',
      preview: { sheets: [sheet('CSV', [['one']])], truncated: false }
    });

    expect(fixture.nativeElement.querySelector('.sheet-tabs')).toBeNull();
  });

  it('says so when the grid was clipped', async () => {
    const fixture = await render({
      name: 'big.xlsx',
      preview: { sheets: [{ name: 'Big', rows: [['a']], hiddenRows: 50, hiddenColumns: 0 }], truncated: true }
    });

    expect(fixture.nativeElement.querySelector('.truncation-note').textContent).toContain(
      'SpreadsheetPreviewTruncated'
    );
  });

  it('explains an empty spreadsheet instead of rendering a bare table', async () => {
    const fixture = await render({
      name: 'empty.xlsx',
      preview: { sheets: [sheet('Empty', [])], truncated: false }
    });

    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('SpreadsheetPreviewEmpty');
  });
});
