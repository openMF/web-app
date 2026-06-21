/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpResponse } from './models/mcp-response.model';
import { ActionCard, ActionCardType } from './models/action-card.model';

const CARD_FENCE_RE = /```action_card\r?\n([\s\S]*?)\r?\n```/g;
const SUGGEST_FENCE_RE = /```suggest\r?\n([\s\S]*?)\r?\n```/g;
const VALID_TYPES = new Set<ActionCardType>([
  'client',
  'loan',
  'savings',
  'insight',
  'confirmation'
]);

/**
 * Parses raw MCP/LLM output into structured action cards and follow-ups.
 * Must degrade gracefully on malformed or partial responses - never throw
 * to the UI. Pure logic, see response-parser.spec.ts.
 */
export class ResponseParser {
  /** Extract action-card tokens from a completed response body. */
  parseCards(raw: string): ActionCard[] {
    const cards: ActionCard[] = [];
    let match: RegExpExecArray | null;
    CARD_FENCE_RE.lastIndex = 0;
    while ((match = CARD_FENCE_RE.exec(raw)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.title === 'string' &&
          VALID_TYPES.has(parsed.type) &&
          parsed.data !== null &&
          typeof parsed.data === 'object'
        ) {
          cards.push(parsed as ActionCard);
        }
      } catch {
        // malformed JSON - skip silently
      }
    }
    return cards;
  }

  /** Extract suggested follow-up prompts. */
  parseSuggestions(raw: string): string[] {
    const suggestions: string[] = [];
    let match: RegExpExecArray | null;
    SUGGEST_FENCE_RE.lastIndex = 0;
    while ((match = SUGGEST_FENCE_RE.exec(raw)) !== null) {
      const lines = match[1].split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          suggestions.push(trimmed);
        }
      }
    }
    return suggestions;
  }

  /** Assemble a full response object from accumulated stream text. */
  parse(raw: string): McpResponse {
    const actionCards = this.parseCards(raw);
    const suggestedPrompts = this.parseSuggestions(raw);
    const text = raw
      .replace(CARD_FENCE_RE, '')
      .replace(SUGGEST_FENCE_RE, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return { text, actionCards, suggestedPrompts };
  }
}
