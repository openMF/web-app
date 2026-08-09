/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
  });

  /** The pipe escapes first; render() operates on escaped text. */
  const render = (raw: string): string => (pipe as any).render((pipe as any).escapeHtml(raw));

  it('renders a markdown table as real rows and columns', () => {
    const raw =
      '| Client ID | Name | Status |\n|:---|:---|:---|\n| 1 | Anita Desai | Active |\n| 2 | Sunita Verma | Active |';
    const html = render(raw);

    expect(html).toContain('<table class="md-table"');
    expect(html).toContain('<th>Client ID</th>');
    expect(html).toContain('<td>Anita Desai</td>');
    expect(html).toContain('<td>Sunita Verma</td>');
    expect((html.match(/<tr>/g) || []).length).toBe(3); // header + 2 body rows
  });

  it('a lone pipe-ish line without a separator stays plain text', () => {
    const html = render('| just | text |');
    expect(html).not.toContain('<table');
  });

  it('escapes HTML inside table cells (no injection through model output)', () => {
    const raw = '| A |\n|---|\n| <script>alert(1)</script> |';
    const html = render(raw);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('still renders code fences, bullets and inline markdown', () => {
    const html = render('**bold** and `code`\n- item\n```json\n{"a":1}\n```');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('md-inline-code');
    expect(html).toContain('<li>item</li>');
    expect(html).toContain('md-code');
  });
});
