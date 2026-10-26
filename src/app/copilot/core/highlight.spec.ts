/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { highlightCode, highlightLanguage } from './highlight';

describe('highlightLanguage', () => {
  it('recognises the aliases a model actually writes', () => {
    expect(highlightLanguage('ts')).toBe('js');
    expect(highlightLanguage('TypeScript')).toBe('js');
    expect(highlightLanguage('yml')).toBe('yaml');
    expect(highlightLanguage('bash')).toBe('shell');
  });

  it('is null for a language it does not colour', () => {
    expect(highlightLanguage('brainfuck')).toBeNull();
    expect(highlightLanguage('')).toBeNull();
  });
});

describe('highlightCode', () => {
  it('leaves an unknown language exactly as it was', () => {
    const code = 'some plain text 123';
    expect(highlightCode(code, 'cobol')).toBe(code);
  });

  it('marks keywords, numbers and strings', () => {
    const html = highlightCode("const x = 42; const s = 'hi';", 'js');
    expect(html).toContain('<span class="hl-keyword">const</span>');
    expect(html).toContain('<span class="hl-number">42</span>');
    expect(html).toContain('<span class="hl-string">\'hi\'</span>');
  });

  it('marks a double-quoted string that arrived escaped', () => {
    const html = highlightCode('{&quot;principal&quot;: 50000}', 'json');
    expect(html).toContain('<span class="hl-string">&quot;principal&quot;</span>');
    expect(html).toContain('<span class="hl-number">50000</span>');
  });

  /** A keyword inside a string is part of the string, not a keyword. */
  it('does not colour a keyword that lives inside a string', () => {
    const html = highlightCode("const a = 'const';", 'js');
    expect(html).toContain('<span class="hl-string">\'const\'</span>');
    expect(html.match(/hl-keyword/g)?.length).toBe(1);
  });

  it('does not colour anything inside a comment', () => {
    const html = highlightCode('// const x = 1\nconst y = 2;', 'js');
    expect(html).toContain('<span class="hl-comment">// const x = 1</span>');
    // Only the second, real `const` is a keyword.
    expect(html.match(/hl-keyword/g)?.length).toBe(1);
  });

  it('treats SQL keywords without caring about case', () => {
    const html = highlightCode('select * from m_loan where id = 1', 'sql');
    expect(html).toContain('<span class="hl-keyword">select</span>');
    expect(html).toContain('<span class="hl-keyword">where</span>');
  });

  it('marks a SQL comment', () => {
    expect(highlightCode('-- a note\nselect 1', 'sql')).toContain('<span class="hl-comment">-- a note</span>');
  });

  it('marks a yaml comment with a hash', () => {
    expect(highlightCode('# a note\nkey: 1', 'yaml')).toContain('<span class="hl-comment"># a note</span>');
  });

  /**
   * The input is already escaped upstream, and nothing here may introduce markup that could
   * be read as a tag. Only the spans this module writes should appear.
   */
  it('adds no markup beyond its own spans', () => {
    const html = highlightCode('&lt;script&gt;alert(1)&lt;/script&gt;', 'js');
    expect(html).not.toContain('<script');
    expect(html.replace(/<\/?span[^>]*>/g, '')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('keeps the text intact when the spans are stripped back off', () => {
    const code = 'const total = 50000; // the principal\n';
    expect(highlightCode(code, 'js').replace(/<\/?span[^>]*>/g, '')).toBe(code);
  });
});
