/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * The assistant's markdown, as the text an officer actually wants to keep.
 *
 * <p>Replies are markdown because the panel renders them. The moment one leaves the panel,
 * that markup stops helping: a loan officer pasting a repayment schedule into a case note or
 * a PDF wants the schedule, not asterisks around it. This undoes exactly the grammar
 * {@link MarkdownPipe} renders, so what is copied matches what was on screen.
 */
export function toPlainText(markdown: string | null | undefined): string {
  const source = markdown ?? '';
  // Fenced blocks are held out of the line pass: their contents are literal, and stripping
  // markdown from a JSON payload or a code sample would corrupt it.
  const segments = source.split(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g);
  const rendered = segments.map((segment, index) =>
    index % 2 === 1 ? segment.replace(/\n+$/, '') : renderProse(segment)
  );
  return rendered
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderProse(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // A table becomes aligned columns. Pipes read as noise in an email; padding does not.
    if (isTableRow(line) && isTableSeparator(lines[i + 1])) {
      const rows: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      i--;
      out.push(...alignTable(rows));
      continue;
    }

    const bullet = /^(\s*)[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      out.push(`${bullet[1]}- ${inline(bullet[2])}`);
      continue;
    }

    // A heading keeps its words and loses its hashes.
    const heading = /^\s{0,3}#{1,6}\s+(.*)$/.exec(line);
    out.push(heading ? inline(heading[1]) : inline(line));
  }
  return out.join('\n');
}

function alignTable(rows: string[]): string[] {
  const cells = (row: string): string[] =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => inline(cell.trim()));
  // rows[1] is the |---|---| separator, which carries alignment and no content.
  const grid = [
    cells(rows[0]),
    ...rows.slice(2).map(cells)
  ];
  const columns = Math.max(...grid.map((row) => row.length));
  const widths: number[] = [];
  for (let column = 0; column < columns; column++) {
    widths.push(Math.max(...grid.map((row) => (row[column] ?? '').length)));
  }
  return grid.map((row) =>
    row
      .map((cell, column) => (column === row.length - 1 ? cell : cell.padEnd(widths[column])))
      .join('  ')
      .trimEnd()
  );
}

function isTableRow(line: string | undefined): boolean {
  return !!line && line.trim().startsWith('|') && line.includes('|', 1);
}

function isTableSeparator(line: string | undefined): boolean {
  return !!line && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
}

/** Inline emphasis, unwrapped. The same three forms the panel renders, and no others. */
function inline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1');
}
