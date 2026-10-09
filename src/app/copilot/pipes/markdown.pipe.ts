/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { renderMarkdown } from '../core/markdown';

/**
 * Assistant messages, rendered on screen.
 *
 * Security: the markup comes from {@link renderMarkdown}, which escapes the model's output
 * before re-introducing a fixed allow-list of markdown. It is trusted here because we built
 * it from escaped text, not because the model can be trusted.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translate = inject(TranslateService);

  /**
   * The last markup produced, and the trusted wrapper handed out for it.
   *
   * <p>One pair per pipe instance, and Angular builds one instance per binding, so this is
   * per message rather than shared between them.
   */
  private lastHtml: string | null = null;
  private lastSafe: SafeHtml | null = null;

  transform(value: string | null | undefined, streaming = false): SafeHtml {
    // The copy control inside a fenced block is built as raw markup, so it cannot reach the
    // translate pipe. Its label is resolved here instead, where a TranslateService is at hand.
    const html = renderMarkdown(value, this.translate.instant('copilot.actions.copyCode'), streaming);

    // Hand back the SAME wrapper when the markup has not changed, because [innerHTML] compares
    // by reference and bypassSecurityTrustHtml mints a new object every call. A token that
    // changes nothing on screen — every token of a ```suggest``` block, which is stripped as it
    // arrives — otherwise rewrites the bubble anyway, and rewriting it rebuilds the element
    // carrying the newest-word fade. That restarted the animation on whatever word happened to
    // be last, so the tail of the answer blinked for as long as the stripped block took to
    // stream. Comparing the markup covers the language and the streaming flag too, since both
    // are already baked into it.
    if (html === this.lastHtml && this.lastSafe !== null) {
      return this.lastSafe;
    }
    this.lastHtml = html;
    this.lastSafe = this.sanitizer.bypassSecurityTrustHtml(html);
    return this.lastSafe;
  }
}
