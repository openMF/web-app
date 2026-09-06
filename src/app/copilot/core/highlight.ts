/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Colour for the few languages the assistant actually emits.
 *
 * <p>Deliberately not a highlighting library. The Copilot answers about loans and clients, and
 * the code in a reply is a JSON payload, a SQL query or a snippet of configuration. A general
 * highlighter is hundreds of kilobytes for grammars nobody here will hit, on a panel that is
 * lazy-loaded precisely so it costs nothing until it is opened.
 *
 * <p>What this does instead is one pass per language over already-escaped text, marking
 * strings, numbers, comments and keywords. It will not colour every construct correctly, and
 * that is the accepted trade: the point is to make a payload skimmable, not to be an IDE. When
 * a language is unknown the text is returned untouched, which is the honest outcome.
 *
 * <p>Input MUST already be HTML-escaped. Everything below inserts &lt;span&gt; wrappers into
 * that text, so passing raw model output here would defeat the escaping done upstream.
 */

/** Languages worth a pass, mapped from the aliases a model actually writes. */
const ALIASES: Record<string, string> = {
  js: 'js',
  javascript: 'js',
  ts: 'js',
  typescript: 'js',
  json: 'json',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  shell: 'shell'
};

const KEYWORDS: Record<string, string[]> = {
  js: [
    'const',
    'let',
    'var',
    'function',
    'return',
    'if',
    'else',
    'for',
    'while',
    'class',
    'new',
    'await',
    'async',
    'import',
    'export',
    'from',
    'try',
    'catch',
    'throw',
    'typeof',
    'interface',
    'type',
    'true',
    'false',
    'null',
    'undefined'
  ],
  json: [
    'true',
    'false',
    'null'
  ],
  sql: [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'ON',
    'GROUP',
    'ORDER',
    'BY',
    'HAVING',
    'LIMIT',
    'INSERT',
    'INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE',
    'CREATE',
    'TABLE',
    'ALTER',
    'DROP',
    'AND',
    'OR',
    'NOT',
    'NULL',
    'AS',
    'DISTINCT',
    'COUNT',
    'SUM'
  ],
  yaml: [
    'true',
    'false',
    'null'
  ],
  shell: [
    'if',
    'then',
    'fi',
    'for',
    'in',
    'do',
    'done',
    'echo',
    'export',
    'cd',
    'sudo',
    'curl',
    'npm'
  ]
};

/** Comment openers per language, as they appear once escaped. */
const LINE_COMMENT: Record<string, RegExp | null> = {
  js: /\/\/[^\n]*/g,
  json: null,
  sql: /--[^\n]*/g,
  yaml: /#[^\n]*/g,
  shell: /#[^\n]*/g
};

/** The language this block will be coloured as, or null to leave it alone. */
export function highlightLanguage(language: string): string | null {
  return ALIASES[(language ?? '').trim().toLowerCase()] ?? null;
}

/**
 * Colour one block of ALREADY-ESCAPED code.
 *
 * <p>Runs as a single scan rather than a chain of replaces. Chained replaces re-enter text that
 * earlier passes have already wrapped, so a keyword inside a string, or the word "span" inside
 * a comment, ends up mangled. Scanning once and consuming each match whole avoids that.
 */
export function highlightCode(escaped: string, language: string): string {
  const lang = highlightLanguage(language);
  if (!lang) {
    return escaped;
  }
  const keywords = new Set(KEYWORDS[lang]);
  const caseInsensitive = lang === 'sql';
  const comment = LINE_COMMENT[lang];

  // One alternation, tried in order at each position: comments and strings first, because
  // their contents must never be examined for anything else.
  const parts: string[] = [
    comment ? comment.source : null,
    '&quot;(?:[^&\\\\]|\\\\.|&(?!quot;))*&quot;',
    "'(?:[^'\\\\]|\\\\.)*'",
    '\\b\\d+(?:\\.\\d+)?\\b',
    '[A-Za-z_$][\\w$]*'
  ].filter((part): part is string => part !== null);
  const scanner = new RegExp(parts.join('|'), 'g');

  let out = '';
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = scanner.exec(escaped)) !== null) {
    const token = match[0];
    out += escaped.slice(last, match.index);
    last = match.index + token.length;

    if (comment && token.startsWith(commentOpener(lang))) {
      out += wrap('comment', token);
    } else if (token.startsWith('&quot;') || token.startsWith("'")) {
      out += wrap('string', token);
    } else if (/^\d/.test(token)) {
      out += wrap('number', token);
    } else if (keywords.has(caseInsensitive ? token.toUpperCase() : token)) {
      out += wrap('keyword', token);
    } else {
      out += token;
    }
  }
  return out + escaped.slice(last);
}

function commentOpener(lang: string): string {
  return lang === 'js' ? '//' : lang === 'sql' ? '--' : '#';
}

/** The token text is already escaped, so it is placed inside the span verbatim. */
function wrap(kind: string, token: string): string {
  return `<span class="hl-${kind}">${token}</span>`;
}
