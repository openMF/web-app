/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { highlightCode } from './highlight';

/**
 * The assistant's markdown, as the HTML the panel shows.
 *
 * <p>Security: the raw string is HTML-escaped FIRST, so any tags the model emits are
 * neutralised. Only a fixed allow-list of markdown (bold, italic, inline code, bullet lists,
 * tables, fenced blocks) is then re-introduced as markup. The result is therefore trusted
 * because it was built from escaped text, and that reasoning holds wherever it is used.
 *
 * <p>Kept apart from the pipe that renders it on screen because it is also what an exported
 * PDF is built from: a filed document has to say what the officer read, and two renderers
 * would eventually disagree.
 */
export function renderMarkdown(markdown: string | null | undefined, copyLabel = '', streaming = false): string {
  const html = render(escapeHtml(withoutHalfWrittenMarkup(markdown ?? '')), copyLabel);
  return streaming ? markNewestWord(html) : html;
}

/**
 * Wrap the word that has just arrived, so it can fade in rather than snap on.
 *
 * <p>The bubble is rebuilt from the whole reply on every token, so there is no diff to work
 * from and no way to know which nodes are new. What is knowable is that the LAST word is the
 * one that was not there a moment ago. Marking it means each token gets a fresh element with
 * the animation on it, and the words before it are plain — which is exactly the effect wanted,
 * for the cost of one regex per token.
 *
 * <p>Skipped when the reply currently ends inside a fenced block or a table: those are
 * rebuilt wholesale as the rows arrive, and a word fading inside them flickers rather than
 * settles.
 */
function markNewestWord(html: string): string {
  if (/<\/(?:pre|table)>\s*(?:<\/[a-z]+>\s*)*$/i.test(html)) {
    return html;
  }
  // The final run of non-space, non-markup characters, ignoring any tags that close after it.
  return html.replace(/([^\s<>]+)((?:\s|<\/[a-z]+>|<br\/?>)*)$/i, '<span class="md-token">$1</span>$2');
}

/**
 * Remove what is markup rather than answer, including the parts of it that have only half
 * arrived.
 *
 * <p>Everything here exists because a reply is rendered while it is still being written. A
 * fence that has opened and not closed, or an opener still being spelled out a character at a
 * time, was reaching the screen verbatim: an officer watched ```suggest and the follow-up
 * prompts appear as though the assistant were talking to itself, then saw them vanish and come
 * back as buttons. That was only tidied once the turn ended.
 *
 * <p>The suggest block is instruction to this panel, so it never belongs in the answer at any
 * point. Any other fence still belongs, but its bare opener does not until there is something
 * inside it.
 */
function withoutHalfWrittenMarkup(markdown: string): string {
  const withoutSuggestions = markdown
    // Closed. The closing fence has to open a line of its own, or a prompt that itself mentions
    // three backticks ends the block early and spills the rest of the prompts into the answer.
    .replace(/```suggest\b[\s\S]*?^[ \t]*```[ \t]*$/gim, '')
    // Opened mid-stream and not closed yet. This is what was on screen.
    .replace(/```suggest[\s\S]*$/i, '')
    // The opener itself, arriving a character at a time.
    .replace(/`{3}s(?:u(?:g(?:g(?:e(?:s(?:t)?)?)?)?)?)?\s*$/i, '');

  // A trailing fence opener of any other kind: hold it until it has content. Counted rather
  // than matched, because the same three characters close a block, and stripping the close of
  // a finished one would spill the code into the prose around it.
  const fences = (withoutSuggestions.match(/```/g) ?? []).length;
  return fences % 2 === 1 ? withoutSuggestions.replace(/```[a-z0-9_-]*[ \t]*\n?$/i, '') : withoutSuggestions;
}

function escapeHtml(text: string): string {
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
function render(escaped: string, copyLabel: string): string {
  // Capture the language as well as the body: it is what labels the block on screen, and
  // discarding it was why every block read as anonymous text.
  const segments = escaped.split(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g);
  const out: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    // Each fence contributes two capture groups, so a matched block occupies i+1 and i+2.
    if (i % 3 === 1) {
      const language = segments[i] ?? '';
      // No trim: leading indentation and trailing blank lines are meaningful in
      // Python/YAML/nested JSON, so fenced content is rendered verbatim.
      const body = segments[i + 1] ?? '';
      out.push(renderCode(language, body, copyLabel));
      i++;
      continue;
    }
    const segment = segments[i];
    if (segment.trim().length > 0 || segments.length === 1) {
      out.push(renderText(segment));
    }
  }
  return out.join('\n');
}

/**
 * A fenced block, with its language named and a control to take the code.
 *
 * <p>The language is shown because an officer pasting a snippet needs to know what it is, and
 * the copy button exists because selecting many lines of pre-formatted text inside a scrolling
 * chat panel is genuinely awkward. The body is already escaped, so it is inserted verbatim;
 * the language is escaped again on its way into the attribute because it reaches here from the
 * model and only the body has been through escapeHtml.
 */
function renderCode(language: string, body: string, copyLabel: string): string {
  const safeLanguage = escapeHtml(language).slice(0, 24);
  const label = safeLanguage
    ? `<span class="md-code__lang">${safeLanguage}</span>`
    : '<span class="md-code__lang md-code__lang--none"></span>';
  return (
    `<div class="md-code-wrap">` +
    `<div class="md-code__bar">${label}` +
    `<button type="button" class="md-code__copy" data-copy aria-label="${escapeHtml(copyLabel)}" title="${escapeHtml(copyLabel)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>` +
    `</button></div>` +
    `<pre class="md-code"><code>${highlightCode(body, language)}</code></pre>` +
    `</div>`
  );
}

function renderText(escaped: string): string {
  const lines = escaped.split('\n');
  const out: string[] = [];
  let listOpen = false;
  let numberedOpen = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // GitHub-style table: a header row of pipes followed by a |---|---| separator.
    if (isTableRow(line) && isTableSeparator(lines[i + 1])) {
      const table: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        table.push(lines[i]);
        i++;
      }
      i--; // step back; the outer loop will advance
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
      if (numberedOpen) {
        out.push('</ol>');
        numberedOpen = false;
      }
      out.push(renderTable(table));
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (numberedOpen) {
        out.push('</ol>');
        numberedOpen = false;
      }
      if (!listOpen) {
        out.push('<ul class="md-list">');
        listOpen = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    // "1." / "2)" — a model asked for steps answers with these constantly, and they were
    // reaching the screen as literal digits followed by a full stop.
    const numbered = /^\s*\d{1,3}[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
      if (!numberedOpen) {
        out.push('<ol class="md-list md-list--numbered">');
        numberedOpen = true;
      }
      out.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
    if (numberedOpen) {
      out.push('</ol>');
      numberedOpen = false;
    }

    // Headings. Capped at three levels: a chat bubble has no room for a six-level hierarchy,
    // and deeper hashes read better flattened than rendered as ever-smaller text.
    const heading = /^\s*(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length, 3);
      out.push(`<h${level} class="md-heading md-heading--${level}">${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Blockquote. Consecutive lines join into one quote rather than stacking separate ones.
    const quote = /^\s*&gt;\s?(.*)$/.exec(line);
    if (quote) {
      const quoted: string[] = [];
      let next = /^\s*&gt;\s?(.*)$/.exec(lines[i]);
      while (i < lines.length && next) {
        quoted.push(inline(next[1]));
        i++;
        next = i < lines.length ? /^\s*&gt;\s?(.*)$/.exec(lines[i]) : null;
      }
      i--;
      out.push(`<blockquote class="md-quote">${quoted.join('<br/>')}</blockquote>`);
      continue;
    }
    if (line.trim().length === 0) {
      out.push('<br/>');
    } else {
      out.push(inline(line));
    }
  }
  if (listOpen) {
    out.push('</ul>');
  }
  if (numberedOpen) {
    out.push('</ol>');
  }
  return out.join('\n');
}

function isTableRow(line: string | undefined): boolean {
  return !!line && line.trim().startsWith('|') && line.includes('|', 1);
}

/** The |---|:--:|---| line under a table header (dashes, optional alignment colons). */
function isTableSeparator(line: string | undefined): boolean {
  return !!line && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
}

/** Render a fenced markdown table into a scrollable HTML table. */
function renderTable(rows: string[]): string {
  const cells = (row: string): string[] =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
  const header = cells(rows[0]);
  const bodyRows = rows.slice(2); // rows[1] is the separator

  const head = header.map((cell) => `<th>${inline(cell)}</th>`).join('');
  const body = bodyRows
    .map(
      (row) =>
        `<tr>${cells(row)
          .map((cell) => `<td>${inline(cell)}</td>`)
          .join('')}</tr>`
    )
    .join('');
  return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** Inline markdown: **bold**, *italic*, `code`. Operates on already-escaped text. */
function inline(text: string): string {
  return (
    text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
      // [text](url). Only http(s) survives: the text arrives from a model, and javascript:
      // or data: in an href is the one thing in a link that can act rather than navigate.
      // rel="noopener" because target="_blank" without it hands the opener to the new page.
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (_match, label: string, href: string) =>
          `<a class="md-link" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
      )
  );
}
