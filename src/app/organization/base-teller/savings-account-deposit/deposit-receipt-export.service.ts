/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { downloadBlob } from 'app/core/utils/file-download.utils';

export interface DepositReceiptField {
  label: string;
  value: string;
}

export interface ReceiptLayoutRow {
  top: number;
  bottom: number;
  /** Safe boundaries after rendered text lines, in canvas pixels. */
  lines: number[];
}

/** Prefer complete rows; only a row taller than a page may be split between rendered lines. */
export function receiptPageSlices(
  height: number,
  pageHeight: number,
  rows: ReceiptLayoutRow[]
): { top: number; height: number }[] {
  if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(pageHeight) || pageHeight <= 0)
    throw new Error('Invalid receipt dimensions');
  const boundaries = [
    ...new Set(
      rows
        .flatMap((row) => [
          Math.floor(row.top),
          Math.ceil(row.bottom),
          ...(Math.ceil(row.bottom) - Math.floor(row.top) > pageHeight ? row.lines : [])
        ])
        .filter((point) => Number.isInteger(point) && point > 0 && point <= height)
    )
  ].sort((a, b) => a - b);
  const slices: { top: number; height: number }[] = [];
  let top = 0;
  while (top < height) {
    const limit = Math.min(height, top + pageHeight);
    // Trailing paper padding must not create a blank page when all receipt text already fits.
    if (limit < height && rows.length && rows.every((row) => row.bottom <= limit)) {
      slices.push({ top, height: limit - top });
      break;
    }
    const bottom = limit === height ? height : boundaries.filter((point) => point > top && point <= limit).at(-1);
    // Never fall back to cutting arbitrary pixels through financial text.
    if (bottom == null) throw new Error('No safe receipt page break');
    slices.push({ top, height: bottom - top });
    top = bottom;
  }
  return slices;
}

/** Browser-rendered Unicode follows the established Copilot export pattern; no new PDF dependency. */
@Injectable({ providedIn: 'root' })
export class DepositReceiptExportService {
  async download(title: string, amount: string, fields: DepositReceiptField[], identifier: string): Promise<void> {
    const [
      { default: html2canvas },
      { jsPDF }
    ] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    const page = document.createElement('section');
    page.setAttribute('aria-hidden', 'true');
    page.style.cssText =
      'position:fixed;left:-10000px;top:0;width:640px;padding:32px;box-sizing:border-box;background:#fff;color:#111;font:16px/1.6 Roboto,Arial,sans-serif;';
    const append = (parent: HTMLElement, tag: string, text: string, style: string) => {
      const node = document.createElement(tag);
      node.textContent = text;
      node.style.cssText = style;
      parent.appendChild(node);
      return node;
    };
    append(page, 'h1', 'Mifos X', 'font-size:24px;margin:0;');
    append(page, 'h2', title, 'font-size:18px;margin:8px 0;');
    append(page, 'p', amount, 'font-size:32px;font-weight:600;margin:0 0 24px;overflow-wrap:anywhere;');
    const details = append(page, 'dl', '', 'margin:0;');
    for (const field of fields) {
      const row = append(details, 'div', '', 'display:flow-root;');
      row.className = 'deposit-export-row';
      append(row, 'dt', field.label, 'font-size:14px;color:#444;border-top:1px solid #ddd;padding-top:8px;');
      append(row, 'dd', field.value, 'font-weight:500;margin:0 0 8px;white-space:pre-wrap;overflow-wrap:anywhere;');
    }
    document.body.appendChild(page);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pixelsPerMm = canvas.width / 180;
      const pageHeight = Math.floor(267 * pixelsPerMm);
      const bounds = page.getBoundingClientRect();
      if (bounds.width <= 0) throw new Error('Receipt layout unavailable');
      const scale = canvas.width / bounds.width;
      const rows: ReceiptLayoutRow[] = Array.from(details.children, (row) => {
        const rect = row.getBoundingClientRect();
        const value = row.querySelector('dd')!;
        const range = document.createRange();
        range.selectNodeContents(value);
        const lines = Array.from(range.getClientRects())
          .filter((line) => line.height > 0)
          .sort((a, b) => a.top - b.top);
        // Bidi fragments and preserved newlines can have multiple rectangles on the same line.
        // Merge those first, then cut in the whitespace, not on the glyph rectangle's edge:
        // canvas font rasterization can extend an antialiased descender beyond that edge.
        const lineBoxes: { top: number; bottom: number }[] = [];
        for (const line of lines) {
          const previous = lineBoxes.at(-1);
          if (previous && line.top < previous.bottom) previous.bottom = Math.max(previous.bottom, line.bottom);
          else lineBoxes.push({ top: line.top, bottom: line.bottom });
        }
        return {
          top: (rect.top - bounds.top) * scale,
          bottom: (rect.bottom - bounds.top) * scale,
          lines: lineBoxes.slice(0, -1).flatMap((line, index) => {
            const next = lineBoxes[index + 1];
            return next.top > line.bottom ? [Math.round(((line.bottom + next.top) / 2 - bounds.top) * scale)] : [];
          })
        };
      });
      for (const [
        index,
        sliceBounds
      ] of receiptPageSlices(canvas.height, pageHeight, rows).entries()) {
        if (index > 0) pdf.addPage();
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceBounds.height;
        const context = slice.getContext('2d');
        if (!context) throw new Error('Receipt canvas unavailable');
        context.drawImage(canvas, 0, sliceBounds.top, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', 15, 15, 180, slice.height / pixelsPerMm);
      }
      const safeIdentifier = identifier.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 80) || 'receipt';
      downloadBlob(pdf.output('blob'), `deposit-${safeIdentifier}.pdf`);
    } finally {
      page.remove();
    }
  }
}
