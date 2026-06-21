/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ResponseParser } from './response-parser';

describe('ResponseParser', () => {
  let parser: ResponseParser;

  beforeEach(() => {
    parser = new ResponseParser();
  });

  describe('parseCards', () => {
    it('returns empty array for plain text with no card fences', () => {
      expect(parser.parseCards('Hello, here is some text.')).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parser.parseCards('')).toEqual([]);
    });

    it('parses a single valid action card', () => {
      const raw = `Here is the client:

\`\`\`action_card
{"type":"client","title":"Client Details","data":{"Name":"Rajesh Kumar","Status":"Active"}}
\`\`\``;
      const cards = parser.parseCards(raw);
      expect(cards).toHaveLength(1);
      expect(cards[0].type).toBe('client');
      expect(cards[0].title).toBe('Client Details');
      expect(cards[0].data['Name']).toBe('Rajesh Kumar');
    });

    it('parses multiple action cards in one response', () => {
      const raw = `\`\`\`action_card
{"type":"client","title":"Client","data":{"Id":"1"}}
\`\`\`

\`\`\`action_card
{"type":"loan","title":"Active Loan","data":{"Amount":"5000"}}
\`\`\``;
      const cards = parser.parseCards(raw);
      expect(cards).toHaveLength(2);
      expect(cards[0].type).toBe('client');
      expect(cards[1].type).toBe('loan');
    });

    it('parses a card with optional actions array', () => {
      const raw = `\`\`\`action_card
{"type":"confirmation","title":"Disburse Loan","data":{"Amount":"10000"},"actions":[{"label":"Confirm","style":"primary","action":"approve_and_disburse_loan"}]}
\`\`\``;
      const cards = parser.parseCards(raw);
      expect(cards).toHaveLength(1);
      expect(cards[0].actions).toHaveLength(1);
      expect(cards[0].actions![0].label).toBe('Confirm');
    });

    it('skips a card with malformed JSON and returns the rest', () => {
      const raw = `\`\`\`action_card
{bad json here
\`\`\`

\`\`\`action_card
{"type":"insight","title":"Summary","data":{"Key":"Value"}}
\`\`\``;
      const cards = parser.parseCards(raw);
      expect(cards).toHaveLength(1);
      expect(cards[0].type).toBe('insight');
    });

    it('skips a card missing required title field', () => {
      const raw = `\`\`\`action_card
{"type":"client","data":{"Name":"Test"}}
\`\`\``;
      expect(parser.parseCards(raw)).toEqual([]);
    });

    it('skips a card with an invalid type value', () => {
      const raw = `\`\`\`action_card
{"type":"unknown","title":"Bad","data":{}}
\`\`\``;
      expect(parser.parseCards(raw)).toEqual([]);
    });

    it('skips a card missing the data field', () => {
      const raw = `\`\`\`action_card
{"type":"savings","title":"Savings","data":null}
\`\`\``;
      expect(parser.parseCards(raw)).toEqual([]);
    });

    it('does not throw on any input', () => {
      const inputs = [
        null as unknown as string,
        undefined as unknown as string,
        '{}',
        '```action_card\n\n```'
      ];
      for (const input of inputs) {
        expect(() => parser.parseCards(input ?? '')).not.toThrow();
      }
    });
  });

  describe('parseSuggestions', () => {
    it('returns empty array when no suggest fences exist', () => {
      expect(parser.parseSuggestions('Some response text.')).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(parser.parseSuggestions('')).toEqual([]);
    });

    it('parses suggestions from a single suggest block', () => {
      const raw = `\`\`\`suggest
Show loan details
Check savings balance
\`\`\``;
      const suggestions = parser.parseSuggestions(raw);
      expect(suggestions).toEqual([
        'Show loan details',
        'Check savings balance'
      ]);
    });

    it('trims whitespace from individual suggestions', () => {
      const raw = `\`\`\`suggest
  View client profile
  Open loan account
\`\`\``;
      const suggestions = parser.parseSuggestions(raw);
      expect(suggestions).toEqual([
        'View client profile',
        'Open loan account'
      ]);
    });

    it('ignores blank lines within a suggest block', () => {
      const raw = `\`\`\`suggest
Show client

Show loan
\`\`\``;
      const suggestions = parser.parseSuggestions(raw);
      expect(suggestions).toEqual([
        'Show client',
        'Show loan'
      ]);
    });

    it('collects suggestions from multiple suggest blocks', () => {
      const raw = `\`\`\`suggest
Option A
\`\`\`

Some text.

\`\`\`suggest
Option B
\`\`\``;
      expect(parser.parseSuggestions(raw)).toEqual([
        'Option A',
        'Option B'
      ]);
    });
  });

  describe('parse', () => {
    it('returns empty cards and suggestions with full text for plain string', () => {
      const result = parser.parse('Hello world.');
      expect(result.text).toBe('Hello world.');
      expect(result.actionCards).toEqual([]);
      expect(result.suggestedPrompts).toEqual([]);
    });

    it('returns empty text, empty cards, empty suggestions for empty string', () => {
      const result = parser.parse('');
      expect(result.text).toBe('');
      expect(result.actionCards).toEqual([]);
      expect(result.suggestedPrompts).toEqual([]);
    });

    it('strips card and suggest fences from the prose text', () => {
      const raw = `Here is the client info:

\`\`\`action_card
{"type":"client","title":"Client","data":{"Name":"Priya"}}
\`\`\`

Would you like to do more?

\`\`\`suggest
View loans
\`\`\``;
      const result = parser.parse(raw);
      expect(result.text).toContain('Here is the client info');
      expect(result.text).toContain('Would you like to do more?');
      expect(result.text).not.toContain('action_card');
      expect(result.text).not.toContain('suggest');
      expect(result.actionCards).toHaveLength(1);
      expect(result.suggestedPrompts).toEqual(['View loans']);
    });

    it('collapses triple+ newlines in the stripped text', () => {
      const raw = `Line one.\n\n\n\n\`\`\`action_card\n{"type":"loan","title":"L","data":{}}\n\`\`\`\n\n\n\nLine two.`;
      const result = parser.parse(raw);
      expect(result.text).not.toMatch(/\n{3}/);
    });

    it('never throws on malformed input', () => {
      const malformed = [
        '```action_card\n{broken\n```',
        '```suggest\n\n```',
        '```action_card\n{"type":"client"}\n```',
        '',
        '   '
      ];
      for (const input of malformed) {
        expect(() => parser.parse(input)).not.toThrow();
      }
    });

    it('assembles a complete McpResponse with all fields populated', () => {
      const raw = `The loan is active.

\`\`\`action_card
{"type":"loan","title":"Loan #107","data":{"Balance":"5000","Status":"Active"}}
\`\`\`

\`\`\`suggest
Record a repayment
View repayment schedule
\`\`\``;
      const result = parser.parse(raw);
      expect(result.text.trim()).toBe('The loan is active.');
      expect(result.actionCards[0].title).toBe('Loan #107');
      expect(result.suggestedPrompts).toEqual([
        'Record a repayment',
        'View repayment schedule'
      ]);
    });
  });
});
