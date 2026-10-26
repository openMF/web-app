/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { ChatMessage } from './models/chat-message.model';
import { hasTabularData, tablesIn, tablesInMarkdown } from './tabular';

const reply = (partial: Partial<ChatMessage>): ChatMessage => ({
  id: 'a-1',
  role: 'assistant',
  content: '',
  timestamp: 0,
  ...partial
});

const SCHEDULE = [
  '| Due date | Principal | Interest |',
  '| --- | ---: | ---: |',
  '| 2026-01-05 | 1,000.00 | 45.00 |',
  '| 2026-02-05 | 1,000.00 | 38.50 |'
].join('\n');

describe('tablesInMarkdown', () => {
  it('reads a table back the way it was rendered', () => {
    const [table] = tablesInMarkdown(SCHEDULE);

    expect(table.headers).toEqual([
      'Due date',
      'Principal',
      'Interest'
    ]);
    expect(table.rows).toEqual([
      [
        '2026-01-05',
        '1,000.00',
        '45.00'
      ],
      [
        '2026-02-05',
        '1,000.00',
        '38.50'
      ]
    ]);
  });

  it('finds every table in a reply that answers with several', () => {
    expect(tablesInMarkdown(`${SCHEDULE}\n\nAnd the arrears:\n\n${SCHEDULE}`)).toHaveLength(2);
  });

  it('takes a heading just above the table as its name', () => {
    expect(tablesInMarkdown(`## Repayment schedule\n\n${SCHEDULE}`)[0].title).toBe('Repayment schedule');
    expect(tablesInMarkdown(`**Repayment schedule**\n\n${SCHEDULE}`)[0].title).toBe('Repayment schedule');
  });

  /** A sentence introducing a table is prose; lifting it into a sheet name reads as a mistake. */
  it('leaves a table unnamed when only prose sits above it', () => {
    expect(tablesInMarkdown(`Here is what is due:\n\n${SCHEDULE}`)[0].title).toBeUndefined();
  });

  it('ignores pipes that are not a table', () => {
    expect(tablesInMarkdown('The balance is 500 | pending review.')).toEqual([]);
    expect(tablesInMarkdown('| Just a header |\n| No separator |')).toEqual([]);
  });

  it('ignores a header with a separator but no rows under it', () => {
    expect(tablesInMarkdown('| Due date | Amount |\n| --- | --- |')).toEqual([]);
  });

  it('finds nothing in plain conversational text', () => {
    expect(tablesInMarkdown('The client has one active loan, currently up to date.')).toEqual([]);
  });
});

describe('tablesIn', () => {
  it('treats an action card as the narrow table it is', () => {
    const tables = tablesIn(
      reply({
        actionCards: [
          { type: 'loan', title: 'Loan 000042', data: { Product: 'Group loan', Outstanding: '12,400.00' } }
        ]
      })
    );

    expect(tables).toEqual([
      {
        title: 'Loan 000042',
        headers: [
          'Field',
          'Value'
        ],
        rows: [
          [
            'Product',
            'Group loan'
          ],
          [
            'Outstanding',
            '12,400.00'
          ]
        ]
      }
    ]);
  });

  it('takes the column headings it is given, so they can be translated', () => {
    const [table] = tablesIn(
      reply({ actionCards: [{ type: 'client', title: 'Aisha Bello', data: { Office: 'Head office' } }] }),
      'Campo',
      'Valor'
    );

    expect(table.headers).toEqual([
      'Campo',
      'Valor'
    ]);
  });

  it('collects the prose tables and the cards together', () => {
    const tables = tablesIn(
      reply({
        content: SCHEDULE,
        actionCards: [{ type: 'loan', title: 'Loan 000042', data: { Product: 'Group loan' } }]
      })
    );

    expect(tables).toHaveLength(2);
  });

  it('skips a card that carries no rows', () => {
    expect(tablesIn(reply({ actionCards: [{ type: 'insight', title: 'Nothing to report', data: {} }] }))).toEqual([]);
  });
});

describe('hasTabularData', () => {
  it('is what decides whether a spreadsheet is worth offering', () => {
    expect(hasTabularData(reply({ content: SCHEDULE }))).toBe(true);
    expect(hasTabularData(reply({ content: 'One active loan, up to date.' }))).toBe(false);
  });
});
