/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActionCard } from './action-card.model';

export type ChatRole = 'user' | 'assistant' | 'system';

/** One thing the assistant did, as the officer reads it. */
export interface CopilotStep {
  /** Banking wording from the gateway's manifest, never model-generated. */
  label: string;
  /** False for a step that changes a record; those still pause for approval. */
  readOnly: boolean;
  /** Set once the step has returned. */
  durationMs?: number;
  done: boolean;
}

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
  /**
   * What the assistant actually did, in order.
   *
   * <p>A record rather than a narrative: each entry is a call the gateway made, named by its
   * manifest. This is the part of the answer that can honestly be called an explanation.
   */
  steps?: CopilotStep[];
  /**
   * What the model wrote to itself while working.
   *
   * <p>Kept apart from {@link steps} on purpose. It is text the model produced, not a record
   * of anything, and the panel labels it so.
   */
  workingNotes?: string;
  /**
   * How long the whole turn took, from asking to answered.
   *
   * <p>Wall clock, not a sum of the parts: thinking and a tool call can overlap, and the answer
   * still has to stream after both. This is the wait the officer actually sat through.
   */
  turnMs?: number;
  /** How long the model spent on those notes. */
  notesElapsedMs?: number;
  /** Client discussed in this message, for the audit trail. */
  clientId?: number | null;
  /**
   * The question to send again, on a message that ended in a failure worth retrying.
   *
   * <p>The gateway already says whether an error is worth retrying. Without somewhere to keep
   * the question, the only way to act on that was to type it out again.
   */
  retryPrompt?: string;
  /**
   * What the officer made of this reply, when they said.
   *
   * <p>Kept with the message rather than sent anywhere. The panel holds conversations in the
   * browser precisely so client details never accumulate on the gateway, and a rating carries
   * the reply it is about, so it stays on the same side of that line.
   */
  vote?: 'up' | 'down';
  /**
   * The screen the question was asked from, as a router path.
   *
   * <p>What a colleague needs alongside a shared answer is the record it is about, and by the
   * time it is shared the officer may be three screens away. Recorded locally and never sent:
   * the gateway is already told which client is in focus, and the route adds nothing it needs.
   */
  contextUrl?: string;
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
