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

  it('parses suggestions one per line, stripping list markers', () => {
    const raw = 'Done.\n```suggest\n- Show repayment schedule\n2) Record a repayment\n• Check balance\n```';
    expect(parser.parseSuggestions(raw)).toEqual([
      'Show repayment schedule',
      'Record a repayment',
      'Check balance'
    ]);
  });

  it('collects suggestions across multiple fenced blocks', () => {
    const raw = '```suggest\nFirst\n```\ntext\n```suggest\nSecond\n```';
    expect(parser.parseSuggestions(raw)).toEqual([
      'First',
      'Second'
    ]);
  });

  it('ignores empty lines inside the block', () => {
    expect(parser.parseSuggestions('```suggest\n\nOnly one\n\n```')).toEqual(['Only one']);
  });

  it('returns an empty list when no block is present or input is nullish', () => {
    expect(parser.parseSuggestions('plain prose')).toEqual([]);
    expect(parser.parseSuggestions('')).toEqual([]);
    expect(parser.parseSuggestions(undefined as unknown as string)).toEqual([]);
  });

  it('does NOT expose any action_card parsing (retired per ADR-001 §04)', () => {
    // Approvable cards come only from typed SSE events built server-side; prose that
    // looks like an action card must never become an approvable object.
    expect((parser as unknown as Record<string, unknown>)['parseCards']).toBeUndefined();
    expect((parser as unknown as Record<string, unknown>)['parse']).toBeUndefined();
  });
});
