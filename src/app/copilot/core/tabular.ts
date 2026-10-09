/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChatMessage } from './models/chat-message.model';

/** A grid pulled out of a reply, ready to be written to a spreadsheet. */
export interface CopilotTable {
  /** What the reply called it, when it called it anything. */
  title?: string;
  headers: string[];
  rows: string[][];
}

/**
 * Matches the renderer's own test for a table row, deliberately.
 *
 * <p>What gets exported has to be what the officer read. Two sets of rules for what counts as
 * a table would eventually disagree, and the disagreement would show up as a spreadsheet
 * missing a row that is plainly on screen. See core/markdown.ts.
 */
function isTableRow(line: string | undefined): boolean {
  return !!line && line.trim().startsWith('|') && line.includes('|', 1);
}

/** The |---|:--:|---| line under a table header. */
function isTableSeparator(line: string | undefined): boolean {
  return !!line && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');
}

function cells(row: string): string[] {
  return row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** Strip the inline markup a heading may carry, so a sheet name is not full of asterisks. */
function plainHeading(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/[*`_]/g, '')
    .trim();
}

/**
 * The name the reply gave the table just below `index`, if it gave it one.
 *
 * <p>Only a heading or a line that is nothing but bold text counts. A stray sentence above a
 * table is prose, and lifting it into a sheet name produces something worse than no name.
 */
function titleAbove(lines: string[], index: number): string | undefined {
  for (let i = index - 1; i >= 0 && index - i <= 3; i--) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }
    if (/^#{1,6}\s+\S/.test(line) || /^\*\*[^*]+\*\*:?$/.test(line)) {
      return plainHeading(line) || undefined;
    }
    return undefined; // Ordinary prose: the table is unnamed.
  }
  return undefined;
}

/** Every markdown table in a body of text, in the order they appear. */
export function tablesInMarkdown(markdown: string | null | undefined): CopilotTable[] {
  const lines = (markdown ?? '').split('\n');
  const tables: CopilotTable[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!isTableRow(lines[i]) || !isTableSeparator(lines[i + 1])) {
      continue;
    }
    const start = i;
    const block: string[] = [];
    while (i < lines.length && isTableRow(lines[i])) {
      block.push(lines[i]);
      i++;
    }
    i--;

    const headers = cells(block[0]);
    // block[1] is the separator, which is layout rather than data.
    const rows = block.slice(2).map(cells);
    if (headers.length > 1 && rows.length > 0) {
      tables.push({ title: titleAbove(lines, start), headers, rows });
    }
  }
  return tables;
}

/**
 * The reply's action cards, each as a two-column grid.
 *
 * <p>A card is a grid too, just a narrow one. The gateway builds each as labelled rows it has
 * already resolved and formatted, which is exactly a two-column sheet, and an officer who
 * wants the arrears figures out of three loan cards should not have to retype them.
 *
 * <p>Separate from the markdown tables because the printed exports render the prose through
 * the markdown renderer, which already draws those; only the cards are left to add. Every
 * export format reads its cards from here, so a spreadsheet and a PDF of one reply cannot
 * disagree about what the reply contained.
 */
export function cardTables(message: ChatMessage, labelHeader = 'Field', valueHeader = 'Value'): CopilotTable[] {
  const tables: CopilotTable[] = [];

  for (const card of message.actionCards ?? []) {
    const rows = Object.entries(card.data ?? {}).map(
      ([
        label,
        value
      ]) => [
        label,
        value
      ]
    );
    if (rows.length) {
      tables.push({ title: card.title, headers: [
          labelHeader,
          valueHeader
        ], rows });
    }
  }
  return tables;
}

/** Everything in a reply that has rows and columns: its tables, and its cards. */
export function tablesIn(message: ChatMessage, labelHeader = 'Field', valueHeader = 'Value'): CopilotTable[] {
  return [
    ...tablesInMarkdown(message.content),
    ...cardTables(message, labelHeader, valueHeader)
  ];
}

/** Whether there is anything in this reply a spreadsheet could hold. */
export function hasTabularData(message: ChatMessage): boolean {
  return tablesIn(message).length > 0;
}
