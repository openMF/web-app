/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActionCard } from './action-card.model';

export type ChatRole = 'user' | 'assistant' | 'system';

/** A single message in a conversation. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  /** True while tokens are still streaming in for an assistant message. */
  isStreaming?: boolean;
  /** Structured cards rendered under the message. */
  actionCards?: ActionCard[];
  /** Follow-up prompts suggested by the assistant. */
  suggestedPrompts?: string[];
  /** Which MCP tool produced this message, if any. */
  toolUsed?: string;
  /** Client discussed in this message, for the audit trail. */
  clientId?: number | null;
}

/** A saved conversation shown in the Recent Chats tab. */
export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messageCount: number;
  messages?: ChatMessage[];
}
