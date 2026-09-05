/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { jsPDF } from 'jspdf';
import { ChatMessage } from '../core/models/chat-message.model';
import { renderMarkdown } from '../core/markdown';
import { toPlainText } from '../core/plain-text';
import { CopilotTable, cardTables, tablesIn } from '../core/tabular';
import { sanitizeCsvValue } from '../../core/utils/csv.utils';
import { downloadBlob } from '../../core/utils/file-download.utils';

/** A question and the reply it produced, which is the unit worth filing or passing on. */
export interface Exchange {
  question: ChatMessage | null;
  reply: ChatMessage;
  /** Who asked, so a filed page says whose work it was. */
  askedBy?: string;
  /** The client on screen at the time, when there was one. */
  clientName?: string | null;
}

/**
 * A way of taking a reply out of the panel.
 *
 * <p>Not every reply supports every one. Offering a spreadsheet for a sentence of prose
 * produces a file with a sentence in cell A1, which is not an export so much as a way of
 * wasting somebody's afternoon.
 */
export type CopilotExportFormat = 'pdf' | 'csv' | 'png';

/**
 * Byte-order mark, so a spreadsheet opens the file as UTF-8.
 *
 * <p>Without it Excel reads a .csv in the system's legacy code page, which turns every
 * accented client name into rubbish on exactly the machines this is most likely to be opened
 * on. The other readers ignore it.
 */
const UTF8_BOM = '\ufeff';

/** A4 portrait, in millimetres, with the margin a filed page needs for a punch or a staple. */
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 15;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_MM * 2;

/** Render width of the off-screen page, in CSS pixels, before it is scaled to the paper. */
const RENDER_WIDTH_PX = 780;

@Injectable({ providedIn: 'root' })
export class CopilotExportService {
  private readonly translate = inject(TranslateService);

  /**
   * Which exports this reply can honestly support.
   *
   * <p>Read by the menu, so the officer is never offered a format that would produce a file
   * worth nothing. A spreadsheet needs rows and columns; the rest need only an answer.
   */
  formatsFor(reply: ChatMessage): CopilotExportFormat[] {
    const formats: CopilotExportFormat[] = [];
    if (!reply.content?.trim() && !reply.actionCards?.length) {
      return formats;
    }
    formats.push('pdf');
    if (tablesIn(reply).length > 0) {
      formats.push('csv');
    }
    formats.push('png');
    return formats;
  }

  /** Run one of the formats {@link formatsFor} offered. */
  async export(format: CopilotExportFormat, exchange: Exchange): Promise<void> {
    switch (format) {
      case 'pdf':
        return this.exportToPdf(exchange);
      case 'csv':
        return this.exportToCsv(exchange);
      case 'png':
        return this.exportToPng(exchange);
    }
  }

  /**
   * Write the figures out of a reply as a spreadsheet.
   *
   * <p>Built by hand rather than through a library. The only thing standing between the rows
   * already on screen and a .csv is quoting and an injection guard, and the app has both
   * already; adding a spreadsheet dependency to the bundle every officer downloads would be a
   * poor trade for a comma.
   *
   * <p>Several tables go in one file, each under its own title, rather than one file each.
   * A reply that answers with three tables is one answer, and three downloads for it is three
   * things to find again later.
   */
  async exportToCsv(exchange: Exchange): Promise<void> {
    const tables = tablesIn(
      exchange.reply,
      this.translate.instant('copilot.export.cardField'),
      this.translate.instant('copilot.export.cardValue')
    );
    if (!tables.length) {
      return;
    }
    const blob = new Blob([UTF8_BOM + this.toCsv(tables)], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, this.fileName(exchange, 'csv'));
  }

  /**
   * Photograph the reply, for pasting into a case note or a chat.
   *
   * <p>The same page the PDF is built from, so the two say the same thing. Kept to one image
   * however long the answer is: an image is for showing somebody, and a reader who needs
   * pagination wants the PDF.
   */
  async exportToPng(exchange: Exchange): Promise<void> {
    const { default: html2canvas } = await import('html2canvas');
    const page = this.buildPrintablePage(exchange);
    page.style.padding = '24px';
    document.body.appendChild(page);
    try {
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        downloadBlob(blob, this.fileName(exchange, 'png'));
      }
    } finally {
      page.remove();
    }
  }

  /** Tables to CSV text: titled, blank-line separated, every cell quoted and de-fanged. */
  private toCsv(tables: CopilotTable[]): string {
    if (!tables.length) {
      return '';
    }

    return tables
      .map((table) => {
        const lines = table.title ? [this.csvRow([table.title])] : [];
        lines.push(this.csvRow(table.headers));
        for (const row of table.rows) {
          lines.push(this.csvRow(row));
        }
        return lines.join('\r\n');
      })
      .join('\r\n\r\n');
  }

  /**
   * One CSV line.
   *
   * <p>Every cell is quoted rather than only the ones that need it. A reply can contain any
   * character at all, and deciding case by case is how a stray delimiter ends up shifting a
   * whole row one column to the left. The injection guard runs first, because a value starting
   * with '=' is a formula to a spreadsheet however well it is quoted.
   */
  private csvRow(values: string[]): string {
    return values.map((value) => `"${sanitizeCsvValue(value).replace(/"/g, '""')}"`).join(',');
  }

  /**
   * Turn an exchange into a PDF the officer can file against the client.
   *
   * <p>Rendered through a canvas rather than written as PDF text. jsPDF's built-in fonts
   * cover Latin-1 and nothing else, and this panel is translated into Korean and Nepali among
   * others: a filed banking document showing boxes instead of the reply would be worse than
   * no export at all. Going through the browser's own text rendering also keeps the tables
   * looking like the tables the officer read, which is most of what is worth filing.
   */
  async exportToPdf(exchange: Exchange): Promise<void> {
    // Loaded on demand. Together these are the better part of a megabyte, and the panel now
    // ships on every page, so making every officer download them to ask a question would be a
    // poor trade for something most of them will never press.
    const [
      { default: html2canvas },
      { jsPDF }
    ] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    const page = this.buildPrintablePage(exchange);
    document.body.appendChild(page);
    try {
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false });
      this.paginate(jsPDF, canvas).save(this.fileName(exchange));
    } finally {
      page.remove();
    }
  }

  /**
   * Hand the reply to whatever the officer shares through, with a link back to the record.
   *
   * <p>There is no URL for a reply, and that is deliberate rather than missing: conversations
   * are held in the browser so client details never accumulate on the gateway, and a
   * permalink would mean the opposite. What a colleague actually needs is the answer and the
   * record it came from, so that is what gets shared.
   *
   * @returns how it was shared, so the caller can tell the officer what happened
   */
  async share(exchange: Exchange): Promise<'shared' | 'copied' | 'failed'> {
    const text = this.shareText(exchange);
    const url = this.recordUrl(exchange);
    const title = this.translate.instant('copilot.export.shareTitle');

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(url ? { title, text, url } : { title, text });
        return 'shared';
      } catch (error) {
        // Dismissing the sheet is a decision, not a failure, and must not fall through to a
        // clipboard write the officer did not ask for.
        if ((error as DOMException)?.name === 'AbortError') {
          return 'failed';
        }
      }
    }
    return (await this.copy(url ? `${text}\n\n${url}` : text)) ? 'copied' : 'failed';
  }

  /** The text of a share: the question asked, the answer given, and nothing decorative. */
  private shareText(exchange: Exchange): string {
    const asked = exchange.question?.content?.trim();
    const answer = toPlainText(exchange.reply.content);
    return asked ? `${asked}\n\n${answer}` : answer;
  }

  /** An absolute link to the record the question was asked from, when one is known. */
  private recordUrl(exchange: Exchange): string | null {
    const route = exchange.question?.contextUrl ?? exchange.reply.contextUrl;
    if (!route || typeof window === 'undefined') {
      return null;
    }
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#${route.startsWith('/') ? route : `/${route}`}`;
  }

  private async copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Slice a tall canvas across pages.
   *
   * <p>Each page carries only its own slice. Drawing the whole image at a negative offset is
   * the shorter way to do this and repeats every pixel on every page, which turns a long
   * repayment schedule into a file too big to attach to anything.
   */
  private paginate(JsPdf: typeof jsPDF, canvas: HTMLCanvasElement): jsPDF {
    const pdf = new JsPdf({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const pixelsPerMm = canvas.width / CONTENT_WIDTH_MM;
    const sliceHeightPx = Math.floor(CONTENT_HEIGHT_MM * pixelsPerMm);

    for (let top = 0, page = 0; top < canvas.height; top += sliceHeightPx, page++) {
      const height = Math.min(sliceHeightPx, canvas.height - top);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = height;
      slice.getContext('2d')?.drawImage(canvas, 0, top, canvas.width, height, 0, 0, canvas.width, height);

      if (page > 0) {
        pdf.addPage();
      }
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, height / pixelsPerMm);
    }
    return pdf;
  }

  /** Named for the drawer it will end up in, not for the tool that made it. */
  private fileName(exchange: Exchange, extension = 'pdf'): string {
    const who = (exchange.clientName ?? this.translate.instant('copilot.export.fileNameFallback'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const when = new Date(exchange.reply.timestamp).toISOString().slice(0, 10);
    return `${who || 'copilot'}-${when}.${extension}`;
  }

  /**
   * The page itself, held off-screen while it is photographed.
   *
   * <p>Styled inline and in light colours whatever theme the panel is in: this is paper.
   * Positioned off the left edge rather than hidden, because html2canvas has nothing to
   * measure on an element with no layout.
   */
  private buildPrintablePage(exchange: Exchange): HTMLElement {
    const page = document.createElement('div');
    page.setAttribute('aria-hidden', 'true');
    // Named so the sheet below can outrank the app's own theming. See pageHtml().
    page.className = 'copilot-export-page';
    page.style.cssText = [
      'position:fixed',
      'left:-10000px',
      'top:0',
      `width:${RENDER_WIDTH_PX}px`,
      'padding:0',
      'background:#ffffff',
      'color:#111827',
      "font-family:Roboto,'Helvetica Neue',Arial,sans-serif",
      'font-size:14px',
      'line-height:1.6'
    ].join(';');
    page.innerHTML = this.pageHtml(exchange);
    return page;
  }

  private pageHtml(exchange: Exchange): string {
    const t = (key: string): string => this.translate.instant(key);
    const meta = [
      exchange.clientName ? `${t('copilot.export.client')}: ${exchange.clientName}` : '',
      exchange.askedBy ? `${t('copilot.export.askedBy')}: ${exchange.askedBy}` : '',
      new Date(exchange.reply.timestamp).toLocaleString()
    ]
      .filter(Boolean)
      .join(' &middot; ');

    const question = exchange.question?.content?.trim();
    const questionBlock = question
      ? `<div style="margin:0 0 20px;padding:12px 16px;background:#f3f4f6;border-radius:8px">
           <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">
             ${t('copilot.export.question')}
           </div>
           <div>${this.escape(question)}</div>
         </div>`
      : '';

    return `
      <div style="border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:18px">
        <div style="font-size:18px;font-weight:700">${t('copilot.export.heading')}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px">${meta}</div>
      </div>
      ${questionBlock}
      <div class="copilot-export-answer">${renderMarkdown(exchange.reply.content)}</div>
      ${this.cardsHtml(exchange.reply)}
      <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280">
        ${this.escape(t('copilot.export.disclaimer'))}
      </div>
      <style>
        /*
         * The printed page is paper, and paper is white in both themes.
         *
         * <p>This sheet renders inside the live document, so the app's dark theme reaches it.
         * The rule in theme/_dark_content.scss paints every even tbody row #303135 with an
         * !important, and photographing that put black bands through exported tables. The
         * class is doubled to outrank that selector outright rather than relying on which
         * stylesheet the browser happened to see last.
         */
        .copilot-export-page.copilot-export-page table tbody tr,
        .copilot-export-page.copilot-export-page table tbody tr:nth-child(even) {
          background-color: #ffffff !important;
          color: #111827 !important;
        }

        .copilot-export-answer table, .copilot-export-cards table {
          border-collapse:collapse; width:100%; margin:10px 0; font-size:13px
        }
        .copilot-export-cards caption {
          text-align:left; font-weight:600; padding:0 0 6px; font-size:13px
        }
        .copilot-export-cards th, .copilot-export-cards td,
        .copilot-export-answer th, .copilot-export-answer td {
          border:1px solid #d1d5db; padding:6px 10px; text-align:left
        }
        .copilot-export-answer th, .copilot-export-cards th { background:#f3f4f6; font-weight:600 }
        .copilot-export-answer ul { margin:8px 0; padding-left:20px }
        .copilot-export-answer pre {
          background:#f3f4f6; padding:10px; border-radius:6px; font-size:12px; white-space:pre-wrap
        }
        .copilot-export-answer code { font-family:'Courier New',monospace }
      </style>`;
  }

  /**
   * The reply's action cards, drawn as tables.
   *
   * <p>Without this a printed export showed the sentence introducing a card and then stopped,
   * because the figures an officer actually wanted live on the card rather than in the prose.
   * The rows come from the same helper the spreadsheet export uses, so the two cannot drift.
   */
  private cardsHtml(reply: ChatMessage): string {
    const tables = cardTables(
      reply,
      this.translate.instant('copilot.export.cardField'),
      this.translate.instant('copilot.export.cardValue')
    );

    if (!tables.length) {
      return '';
    }

    const html = tables
      .map((table) => {
        const head = table.headers.map((h) => `<th>${this.escape(h)}</th>`).join('');
        const body = table.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${this.escape(cell)}</td>`).join('')}</tr>`)
          .join('');
        const caption = table.title ? `<caption>${this.escape(table.title)}</caption>` : '';
        return `<table>${caption}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
      })
      .join('');

    return `<div class="copilot-export-cards">${html}</div>`;
  }

  /** The question is text an officer typed, so it is escaped rather than rendered. */
  private escape(text: string): string {
    const holder = document.createElement('div');
    holder.textContent = text;
    return holder.innerHTML;
  }
}
