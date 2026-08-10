/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const SUGGEST_BLOCK = /```suggest\s*([\s\S]*?)```/gi;

/**
 * Extracts follow-up prompts from fenced ```suggest``` blocks in assistant prose.
 *
 * Deliberately narrow (ADR-001 §04): approvable action cards arrive ONLY as typed SSE
 * events constructed server-side from the parsed function call. Model prose that merely
 * looks like an action card renders as plain text — the fenced ```action_card``` parsing
 * path was removed so the LLM can never author the content a human approves against.
 */
export class ResponseParser {
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
}
