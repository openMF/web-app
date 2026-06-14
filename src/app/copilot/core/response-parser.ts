/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpResponse } from './models/mcp-response.model';
import { ActionCard } from './models/action-card.model';

/**
 * Parses raw MCP/LLM output into structured action cards and follow-ups.
 * Must degrade gracefully on malformed or partial responses - never throw
 * to the UI. Pure logic, see response-parser.spec.ts.
 */
export class ResponseParser {
  /** Extract action-card tokens from a completed response body. */
  parseCards(_raw: string): ActionCard[] {
    // TODO: implement ACTION_CARD token parsing.
    throw new Error('Not implemented');
  }

  /** Extract suggested follow-up prompts. */
  parseSuggestions(_raw: string): string[] {
    // TODO: implement follow-up extraction.
    throw new Error('Not implemented');
  }

  /** Assemble a full response object from accumulated stream text. */
  parse(_raw: string): McpResponse {
    // TODO: combine text + cards + suggestions.
    throw new Error('Not implemented');
  }
}
