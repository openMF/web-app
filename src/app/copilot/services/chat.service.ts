/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Models */
import { ChatMessage, Conversation } from '../core/models/chat-message.model';

/**
 * Orchestrates a conversation: sends user input through sanitize -> MCP ->
 * parse, maintains the streaming message list, and persists history to the
 * MCP server (PostgreSQL) with a localStorage fallback.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  /** Live message list for the active conversation. */
  readonly messages$ = new BehaviorSubject<ChatMessage[]>([]);
  /** Saved conversations for the Recent Chats tab. */
  readonly conversations$ = new BehaviorSubject<Conversation[]>([]);

  /** Send a user message and stream the assistant reply. */
  async sendMessage(_content: string): Promise<void> {
    // TODO: sanitize -> save user msg -> stream MCP -> save assistant msg.
    throw new Error('Not implemented');
  }

  /** Cancel an in-flight streaming response. */
  stopStreaming(): void {
    // TODO: abort the active stream.
    throw new Error('Not implemented');
  }

  /** Start a fresh conversation. */
  clearChat(): void {
    // TODO: reset message list + session id.
    throw new Error('Not implemented');
  }

  /** Load persisted conversations for the current user. */
  async loadHistory(): Promise<void> {
    // TODO: GET /api/chat/history/{userId}, fall back to localStorage.
    throw new Error('Not implemented');
  }
}
