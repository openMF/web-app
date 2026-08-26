/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
export function renderMarkdown(markdown: string | null | undefined): string {
  return render(escapeHtml(withoutHalfWrittenMarkup(markdown ?? '')));
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
    // Closed, and any prompts the gateway sent as an event rather than prose.
    .replace(/```suggest\s*[\s\S]*?```/gi, '')
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
function render(escaped: string): string {
  const segments = escaped.split(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g);
  const out: string[] = [];
  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // No trim: leading indentation and trailing blank lines are meaningful in
      // Python/YAML/nested JSON, so fenced content is rendered verbatim.
      out.push(`<pre class="md-code"><code>${segment}</code></pre>`);
    } else if (segment.trim().length > 0 || segments.length === 1) {
      out.push(renderText(segment));
    }
  });
  return out.join('\n');
}

function renderText(escaped: string): string {
  const lines = escaped.split('\n');
  const out: string[] = [];
  let listOpen = false;

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
      out.push(renderTable(table));
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!listOpen) {
        out.push('<ul class="md-list">');
        listOpen = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
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
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
}
