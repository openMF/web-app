/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';

import { renderMarkdown as render } from './markdown';

/** Lines as the model streams them. */
const lines = (...parts: string[]): string => parts.join('\n');

describe('renderMarkdown', () => {
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

  /**
   * The suggest fence is instruction to the panel, not part of the answer. It used to be
   * removed only once the turn finished, so for the length of the stream the officer watched
   * the assistant apparently talking to itself, then saw that text vanish and reappear as
   * buttons.
   */
  describe('the suggest fence', () => {
    it('never reaches the answer once it has closed', () => {
      const html = render(lines('Here you go.', '```suggest', 'Search for a client', 'List loan products', '```'));

      expect(html).not.toContain('suggest');
      expect(html).not.toContain('Search for a client');
      expect(html).toContain('Here you go.');
    });

    /** Mid-stream the fence has opened and not closed. This is what was on screen. */
    it('never reaches the answer while it is still arriving', () => {
      const html = render(lines("What's on your mind?", '```suggest Search for a client List loan products'));

      expect(html).not.toContain('suggest');
      expect(html).not.toContain('Search for a client');
      expect(html).toContain('mind');
    });

    it('hides the opener while it is still being spelled out', () => {
      for (const partial of [
        '```',
        '```s',
        '```sug',
        '```sugges',
        '```suggest'
      ]) {
        expect(render(lines('Ready.', partial))).not.toContain(partial);
      }
    });

    /**
     * The same three characters open and close a fence. Stripping a trailing one blindly would
     * take the close off a finished block and spill the code into the prose around it.
     */
    it('holds back a bare opener but never the close of a finished block', () => {
      expect(render(lines('Here it is.', '```json'))).not.toContain('```');
      expect(render(lines('Here it is.', '```json'))).toContain('Here it is.');

      const closed = render(lines('```json', '{"a":1}', '```'));
      expect(closed).toContain('md-code');
      // Quotes are escaped on the way in, which is what keeps model output out of the markup.
      expect(closed).toContain('&quot;a&quot;');
    });

    /**
     * A prompt is free text and may mention three backticks. Treating the first later fence as
     * the close ended the block early and spilled the rest of the prompts into the answer.
     */
    it('is not closed early by backticks inside a prompt', () => {
      const html = render(
        lines('Here you go.', '```suggest', 'Show me a ```json example', 'List loan products', '```', 'Anything else?')
      );

      expect(html).not.toContain('List loan products');
      expect(html).not.toContain('suggest');
      expect(html).toContain('Here you go.');
      expect(html).toContain('Anything else?');
    });

    /** A real code block is not a suggest block and must survive untouched. */
    it('leaves other fenced blocks alone', () => {
      const html = render(lines('```json', '{"principal": 5000}', '```'));

      expect(html).toContain('md-code');
      expect(html).toContain('principal');
    });
  });

  it('still renders code fences, bullets and inline markdown', () => {
    const html = render('**bold** and `code`\n- item\n```json\n{"a":1}\n```');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('md-inline-code');
    expect(html).toContain('<li>item</li>');
    expect(html).toContain('md-code');
  });
});
