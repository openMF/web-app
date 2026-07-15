/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActionCard } from './action-card.model';

/** Discriminator for events arriving over the SSE stream. */
export type McpStreamEventType = 'token' | 'tool_call' | 'action_card' | 'done' | 'error';

/** A single Server-Sent Event from the MCP server. */
export interface McpStreamEvent {
  type: McpStreamEventType;
  /** Present for 'token' events: the streamed text fragment. */
  token?: string;
  /** Present for 'tool_call' events. */
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  /** Present for 'action_card' events. */
  card?: ActionCard;
  /** Present for 'error' events. */
  message?: string;
}

/** Fully assembled response after a stream completes. */
export interface McpResponse {
  text: string;
  toolName?: string;
  actionCards: ActionCard[];
  suggestedPrompts: string[];
}
