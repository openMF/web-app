/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MarkdownPipe,
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    pipe = TestBed.inject(MarkdownPipe);
  });

  function html(safe: unknown): string {
    return TestBed.inject(DomSanitizer).sanitize(1 /* SecurityContext.HTML */, safe as never) ?? '';
  }

  it('renders the assistant markdown', () => {
    expect(html(pipe.transform('**Approved**'))).toContain('<strong>Approved</strong>');
  });

  /**
   * [innerHTML] compares by reference, so a fresh wrapper is a DOM rewrite even when the markup
   * is identical — and a rewrite rebuilds the newest-word element, restarting its fade. The
   * ```suggest``` block is stripped as it streams, so every one of its tokens changed the input
   * and nothing on screen, which made the last visible word blink for the length of the block.
   */
  it('keeps the same wrapper while a stripped suggest block streams in', () => {
    const answer = 'Profile recorded.\n\n**Suggested next steps**\n';
    const first = pipe.transform(answer, true);

    // The opener, then the block filling up: none of it may reach the screen, so none of it
    // may rebuild the bubble either.
    const stripped = [
      `${answer}\`\`\``,
      `${answer}\`\`\`sug`,
      `${answer}\`\`\`suggest`,
      `${answer}\`\`\`suggest\nView the loan`,
      `${answer}\`\`\`suggest\nView the loan\nCheck arrears`,
      `${answer}\`\`\`suggest\nView the loan\nCheck arrears\n\`\`\``
    ];
    for (const content of stripped) {
      expect(pipe.transform(content, true)).toBe(first);
    }
  });

  it('hands back a new wrapper once the answer actually changes', () => {
    const first = pipe.transform('Reading the account', true);
    expect(pipe.transform('Reading the account now', true)).not.toBe(first);
  });

  /** Ending the turn drops the newest-word marker, which is a real change to the markup. */
  it('re-renders when the reply stops streaming', () => {
    const streaming = pipe.transform('All done', true);
    expect(pipe.transform('All done', false)).not.toBe(streaming);
  });
});
