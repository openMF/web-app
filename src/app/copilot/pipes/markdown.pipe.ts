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

  transform(value: string | null | undefined, streaming = false): SafeHtml {
    // The copy control inside a fenced block is built as raw markup, so it cannot reach the
    // translate pipe. Its label is resolved here instead, where a TranslateService is at hand.
    return this.sanitizer.bypassSecurityTrustHtml(
      renderMarkdown(value, this.translate.instant('copilot.actions.copyCode'), streaming)
    );
  }
}
