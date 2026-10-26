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
  // ─── Constructs a model reaches for constantly, which used to reach the screen raw ───

  describe('headings', () => {
    it('renders a heading rather than showing its hashes', () => {
      const html = render('## Outstanding balance');
      expect(html).toContain('<h2 class="md-heading md-heading--2">Outstanding balance</h2>');
      expect(html).not.toContain('##');
    });

    it('flattens deeper levels, because a bubble has no room for six', () => {
      expect(render('##### Deep')).toContain('<h3');
    });

    it('leaves a hash that is not a heading alone', () => {
      expect(render('Account #4521 is active')).toContain('Account #4521 is active');
    });
  });

  describe('numbered lists', () => {
    it('renders "1." as a list rather than a literal digit', () => {
      const html = render('1. Read the account\n2. Check the schedule');
      expect(html).toContain('<ol class="md-list md-list--numbered">');
      expect(html).toContain('<li>Read the account</li>');
      expect(html).toContain('<li>Check the schedule</li>');
    });

    it('accepts "1)" as well', () => {
      expect(render('1) First')).toContain('<li>First</li>');
    });

    it('closes a numbered list before a bulleted one starts', () => {
      const html = render('1. First\n- Second');
      expect(html).toContain('</ol>');
      expect(html).toContain('<ul class="md-list">');
    });
  });

  describe('links', () => {
    it('renders an http link, opened safely', () => {
      const html = render('See [the schedule](https://example.org/loans/1)');
      expect(html).toContain('href="https://example.org/loans/1"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('>the schedule</a>');
    });

    /** A model writes the href, so a scheme that can act rather than navigate never renders. */
    it('refuses a javascript: link', () => {
      const html = render('[tap here](javascript:alert(1))');
      // No anchor is built. The text itself stays on screen as escaped, inert prose.
      expect(html).not.toContain('<a');
      expect(html).not.toContain('href');
    });

    it('refuses a data: link', () => {
      expect(render('[x](data:text/html;base64,PHN2Zz4=)')).not.toContain('<a');
    });
  });

  describe('blockquotes', () => {
    it('renders a quote', () => {
      expect(render('> Verify before disbursing')).toContain('<blockquote class="md-quote">');
    });

    it('joins consecutive quote lines into one quote', () => {
      const html = render('> One\n> Two');
      expect(html.match(/<blockquote/g)?.length).toBe(1);
      expect(html).toContain('One<br/>Two');
    });
  });

  describe('code blocks', () => {
    it('names the language of a fenced block', () => {
      const html = render('```json\n{"a":1}\n```');
      expect(html).toContain('<span class="md-code__lang">json</span>');
      // The body is now syntax-coloured, so compare it with the colour spans taken back off.
      expect(html.replace(/<\/?span[^>]*>/g, '')).toContain('{&quot;a&quot;:1}');
    });

    it('still renders a block with no language given', () => {
      const html = render('```\nplain\n```');
      expect(html).toContain('<pre class="md-code">');
      expect(html).toContain('plain');
    });

    it("offers a control to take the code, labelled in the officer's language", () => {
      const html = render('```\nx\n```', 'Copiar código');
      expect(html).toContain('data-copy');
      expect(html).toContain('aria-label="Copiar c\u00f3digo"');
    });

    it('keeps indentation inside a fenced block, which is meaningful in YAML', () => {
      expect(render('```yaml\na:\n  b: 1\n```').replace(/<\/?span[^>]*>/g, '')).toContain('a:\n  b: 1');
    });
  });
});
