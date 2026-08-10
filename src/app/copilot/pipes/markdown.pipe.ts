/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Minimal, SAFE markdown renderer for assistant messages.
 *
 * Security: the raw string is HTML-escaped FIRST, so any tags the model emits
 * are neutralised. Only a fixed allow-list of inline markdown (bold, italic,
 * inline code) and simple bullet lists is then re-introduced as markup. The
 * result is therefore trusted because we built it from escaped text.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    const raw = value ?? '';
    const escaped = this.escapeHtml(raw);
    const html = this.render(escaped);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Fenced ```code``` blocks first (content is already escaped, so it is inserted
   * verbatim inside <pre>), then line-based rendering for the prose between them.
   */
  private render(escaped: string): string {
    const segments = escaped.split(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g);
    const out: string[] = [];
    segments.forEach((segment, index) => {
      if (index % 2 === 1) {
        // No trim: leading indentation and trailing blank lines are meaningful in
        // Python/YAML/nested JSON, so fenced content is rendered verbatim.
        out.push(`<pre class="md-code"><code>${segment}</code></pre>`);
      } else if (segment.trim().length > 0 || segments.length === 1) {
        out.push(this.renderText(segment));
      }
    });
    return out.join('\n');
  }

  private renderText(escaped: string): string {
    const lines = escaped.split('\n');
    const out: string[] = [];
    let listOpen = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // GitHub-style table: a header row of pipes followed by a |---|---| separator.
      if (this.isTableRow(line) && this.isTableSeparator(lines[i + 1])) {
        const table: string[] = [];
        while (i < lines.length && this.isTableRow(lines[i])) {
          table.push(lines[i]);
          i++;
        }
        i--; // step back; the outer loop will advance
        if (listOpen) {
          out.push('</ul>');
          listOpen = false;
        }
        out.push(this.renderTable(table));
        continue;
      }

      const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
      if (bullet) {
        if (!listOpen) {
          out.push('<ul class="md-list">');
          listOpen = true;
        }
        out.push(`<li>${this.inline(bullet[1])}</li>`);
        continue;
      }
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
      if (line.trim().length === 0) {
        out.push('<br/>');
      } else {
        out.push(this.inline(line));
      }
    }
    if (listOpen) {
      out.push('</ul>');
    }
    return out.join('\n');
  }

  private isTableRow(line: string | undefined): boolean {
    return !!line && line.trim().startsWith('|') && line.includes('|', 1);
  }

  /** The |---|:--:|---| line under a table header (dashes, optional alignment colons). */
  private isTableSeparator(line: string | undefined): boolean {
    return !!line && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
  }

  /** Render a fenced markdown table into a scrollable HTML table. */
  private renderTable(rows: string[]): string {
    const cells = (row: string): string[] =>
      row
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim());
    const header = cells(rows[0]);
    const bodyRows = rows.slice(2); // rows[1] is the separator

    const head = header.map((cell) => `<th>${this.inline(cell)}</th>`).join('');
    const body = bodyRows
      .map(
        (row) =>
          `<tr>${cells(row)
            .map((cell) => `<td>${this.inline(cell)}</td>`)
            .join('')}</tr>`
      )
      .join('');
    return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  /** Inline markdown: **bold**, *italic*, `code`. Operates on already-escaped text. */
  private inline(text: string): string {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
  }
}
