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

  it('parses a valid action card', () => {
    const raw =
      'Here are the details.\n```action_card\n{"type":"loan","title":"Loan #107","data":{"Status":"Active","Balance":"5000"}}\n```';
    const cards = parser.parseCards(raw);
    expect(cards).toHaveLength(1);
    expect(cards[0].type).toBe('loan');
    expect(cards[0].title).toBe('Loan #107');
    expect(cards[0].data['Balance']).toBe('5000');
  });

  it('parses multiple cards in one response', () => {
    const raw =
      '```action_card\n{"type":"client","title":"Rajesh","data":{}}\n```\n```action_card\n{"type":"savings","title":"Acct","data":{"Bal":"10"}}\n```';
    expect(parser.parseCards(raw)).toHaveLength(2);
  });

  it('skips malformed JSON without throwing', () => {
    const raw = '```action_card\n{not valid json}\n```';
    expect(parser.parseCards(raw)).toEqual([]);
  });

  it('skips cards with an invalid type', () => {
    const raw = '```action_card\n{"type":"wizardry","title":"X","data":{}}\n```';
    expect(parser.parseCards(raw)).toEqual([]);
  });

  it('skips cards missing a title or data', () => {
    expect(parser.parseCards('```action_card\n{"type":"loan","data":{}}\n```')).toEqual([]);
    expect(parser.parseCards('```action_card\n{"type":"loan","title":"X"}\n```')).toEqual([]);
  });

  it('coerces non-string data values to strings', () => {
    const raw = '```action_card\n{"type":"loan","title":"L","data":{"n":5,"ok":true,"x":null}}\n```';
    const [card] = parser.parseCards(raw);
    expect(card.data).toEqual({ n: '5', ok: 'true', x: '' });
  });

  it('parses suggestion blocks, stripping list markers', () => {
    const raw = '```suggest\n- Show client portfolio\n2. View overdue loans\n```';
    expect(parser.parseSuggestions(raw)).toEqual([
      'Show client portfolio',
      'View overdue loans'
    ]);
  });

  it('keeps leading numbers that are part of the suggestion text', () => {
    const raw = '```suggest\n2026 portfolio summary\n10% arrears report\n```';
    expect(parser.parseSuggestions(raw)).toEqual([
      '2026 portfolio summary',
      '10% arrears report'
    ]);
  });

  it('assembles text with fences stripped and blank lines collapsed', () => {
    const raw =
      'Summary line.\n\n```action_card\n{"type":"loan","title":"L","data":{}}\n```\n\n```suggest\nMore info\n```';
    const result = parser.parse(raw);
    expect(result.text).toBe('Summary line.');
    expect(result.actionCards).toHaveLength(1);
    expect(result.suggestedPrompts).toEqual(['More info']);
  });

  it('returns safe empties for empty, null, and plain-text input', () => {
    expect(parser.parse('')).toEqual({ text: '', actionCards: [], suggestedPrompts: [] });
    expect(parser.parse(null as unknown as string).actionCards).toEqual([]);
    const plain = parser.parse('Just a plain answer with no blocks.');
    expect(plain.text).toBe('Just a plain answer with no blocks.');
    expect(plain.actionCards).toEqual([]);
    expect(plain.suggestedPrompts).toEqual([]);
  });

  it('keeps action button definitions when present', () => {
    const raw =
      '```action_card\n{"type":"confirmation","title":"Confirm","data":{},"actions":[{"label":"Confirm","style":"warn","action":"approve"}]}\n```';
    const [card] = parser.parseCards(raw);
    expect(card.actions).toHaveLength(1);
    expect(card.actions?.[0].label).toBe('Confirm');
  });

  it('drops malformed action buttons (bad style, missing label)', () => {
    const raw =
      '```action_card\n{"type":"loan","title":"L","data":{},"actions":[{"label":"Ok","style":"warn"},{"label":"Bad","style":"explode"},{"style":"primary"}]}\n```';
    const [card] = parser.parseCards(raw);
    expect(card.actions).toHaveLength(1);
    expect(card.actions?.[0].label).toBe('Ok');
  });
});
