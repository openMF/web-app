/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActionCard } from './action-card.model';
import { CopilotContext } from './copilot-context.model';

/**
 * Wire contract v1 (ADR-001) between the web-app and the Copilot gateway.
 * The gateway streams typed SSE events; the frontend never derives approval
 * state from model prose — action cards arrive as structured events.
 */

/** Discriminator for events arriving over the SSE stream. */
export type McpStreamEventType = 'token' | 'tool_call' | 'action_card' | 'suggest' | 'done' | 'error';

/** Error codes defined by wire contract v1. */
export type McpErrorCode =
  'AUTH_EXPIRED' | 'PERMISSION_DENIED' | 'LLM_UNAVAILABLE' | 'TOOL_FAILED' | 'RATE_LIMITED' | 'CANCELLED' | 'INTERNAL';

/**
 * A write action awaiting human confirmation. Constructed server-side from the
 * model's parsed function call — never authored by the model as prose.
 */
export interface PendingAction {
  /** Server-issued id used to approve/reject via the decision endpoint. */
  cardId: string;
  /** MCP tool the gateway will execute on approval. */
  tool: string;
  /** Parsed tool arguments, shown to the officer verbatim. */
  args: Record<string, unknown>;
  /** One-sentence summary of what will happen, built by the gateway. */
  humanSummary: string;
  /** Display-only. The gateway's copy is authoritative (ADR-001 §04). */
  idempotencyKey?: string;
  /** ISO timestamp after which the card can no longer be approved. */
  expiresAt?: string;
}

/** A single Server-Sent Event from the Copilot gateway. */
export interface McpStreamEvent {
  type: McpStreamEventType;
  /** Present for 'token' events: the streamed text fragment. */
  token?: string;
  /** Present for 'tool_call' events. */
  toolName?: string;
  toolPhase?: 'started' | 'finished';
  readOnly?: boolean;
  summary?: string;
  /** Present for 'action_card' events that only display data (no approval). */
  card?: ActionCard;
  /** Present for 'action_card' events that require human approval. */
  pendingAction?: PendingAction;
  /** Present for 'suggest' events: follow-up prompts. */
  suggestions?: string[];
  /** Present for 'done' events. */
  conversationId?: string;
  /** Present for 'error' events. */
  errorCode?: McpErrorCode;
  message?: string;
  retryable?: boolean;
}

/** Body of POST /copilot/api/v1/chat. */
export interface McpChatRequest {
  /** Omitted for the first turn; the gateway assigns one via 'done'. */
  conversationId?: string;
  message: string;
  /** Client-generated id for tracing; NOT an idempotency key (server mints those). */
  clientMsgId: string;
  /** Context silently attached to every turn (screen, client, role, language). */
  context: CopilotContext;
}

/** Body of POST /copilot/api/v1/actions/{cardId}/decision. */
export interface McpDecisionRequest {
  decision: 'approve' | 'reject';
  clientMsgId: string;
}

/** Fully assembled response after a stream completes. */
export interface McpResponse {
  text: string;
  toolName?: string;
  actionCards: ActionCard[];
  suggestedPrompts: string[];
}
