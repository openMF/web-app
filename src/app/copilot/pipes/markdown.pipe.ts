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

  private render(escaped: string): string {
    const lines = escaped.split('\n');
    const out: string[] = [];
    let listOpen = false;

    for (const line of lines) {
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

  /** Inline markdown: **bold**, *italic*, `code`. Operates on already-escaped text. */
  private inline(text: string): string {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
  }
}
