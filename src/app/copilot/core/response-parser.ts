/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpResponse } from './models/mcp-response.model';
import { ActionCard, ActionButtonStyle, ActionCardButton, ActionCardType } from './models/action-card.model';

const CARD_BLOCK = /```action_card\s*([\s\S]*?)```/gi;
const SUGGEST_BLOCK = /```suggest\s*([\s\S]*?)```/gi;
const VALID_TYPES: ReadonlyArray<ActionCardType> = [
  'client',
  'loan',
  'savings',
  'insight',
  'confirmation'
];
const VALID_STYLES: ReadonlyArray<ActionButtonStyle> = [
  'primary',
  'warn',
  'accent'
];

/**
 * Parses assistant output into structured action cards and follow-up prompts.
 * The assistant is instructed (via the system prompt) to emit ```action_card```
 * and ```suggest``` fenced blocks. Parsing always degrades gracefully and never
 * throws to the UI: malformed blocks are skipped and bad input yields safe empties.
 */
export class ResponseParser {
  /** Extract valid action cards from fenced ```action_card``` JSON blocks. */
  parseCards(raw: string): ActionCard[] {
    const cards: ActionCard[] = [];
    for (const match of (raw ?? '').matchAll(CARD_BLOCK)) {
      const card = this.toCard(match[1]);
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }

  /** Extract follow-up prompts from fenced ```suggest``` blocks (one per line). */
  parseSuggestions(raw: string): string[] {
    const suggestions: string[] = [];
    for (const match of (raw ?? '').matchAll(SUGGEST_BLOCK)) {
      for (const line of match[1].split('\n')) {
        const trimmed = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim();
        if (trimmed) {
          suggestions.push(trimmed);
        }
      }
    }
    return suggestions;
  }

  /** Assemble the full response: prose (fences stripped) plus cards and suggestions. */
  parse(raw: string): McpResponse {
    const text = (raw ?? '')
      .replace(CARD_BLOCK, '')
      .replace(SUGGEST_BLOCK, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return {
      text,
      actionCards: this.parseCards(raw),
      suggestedPrompts: this.parseSuggestions(raw)
    };
  }

  /** Parse and validate a single card block; returns null when malformed. */
  private toCard(jsonBlock: string): ActionCard | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonBlock.trim());
    } catch {
      return null;
    }
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const candidate = parsed as Record<string, unknown>;
    const type = candidate['type'];
    const title = candidate['title'];
    const data = candidate['data'];
    if (typeof type !== 'string' || !VALID_TYPES.includes(type as ActionCardType)) {
      return null;
    }
    if (typeof title !== 'string' || !title.trim()) {
      return null;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    const card: ActionCard = {
      type: type as ActionCardType,
      title,
      data: this.toStringRecord(data as Record<string, unknown>)
    };
    const actions = this.toActions(candidate['actions']);
    if (actions.length) {
      card.actions = actions;
    }
    return card;
  }

  /** Validate the actions array, keeping only well-formed buttons. */
  private toActions(raw: unknown): ActionCardButton[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const buttons: ActionCardButton[] = [];
    for (const item of raw) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const entry = item as Record<string, unknown>;
      const label = entry['label'];
      const style = entry['style'];
      if (typeof label !== 'string' || !label.trim()) {
        continue;
      }
      if (typeof style !== 'string' || !VALID_STYLES.includes(style as ActionButtonStyle)) {
        continue;
      }
      const button: ActionCardButton = { label, style: style as ActionButtonStyle };
      if (typeof entry['action'] === 'string') {
        button.action = entry['action'];
      }
      if (typeof entry['route'] === 'string') {
        button.route = entry['route'];
      }
      buttons.push(button);
    }
    return buttons;
  }

  /** Coerce a data object's values to display strings (objects are JSON-encoded). */
  private toStringRecord(input: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [
      key,
      value
    ] of Object.entries(input)) {
      if (value == null) {
        out[key] = '';
      } else if (typeof value === 'object') {
        out[key] = JSON.stringify(value);
      } else {
        out[key] = String(value);
      }
    }
    return out;
  }
}
