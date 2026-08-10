/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';

/** Environment */
import { environment } from '../../../environments/environment';

/** Copilot Core */
import { ChatMessage, Conversation } from '../core/models/chat-message.model';
import { McpStreamEvent, PendingAction } from '../core/models/mcp-response.model';
import { ActionCard } from '../core/models/action-card.model';
import { InputSanitizer } from '../core/input-sanitizer';
import { ResponseParser } from '../core/response-parser';
import { COPILOT_CONFIG } from '../copilot.config';
import { McpClientService } from './mcp-client.service';
import { AiContextService } from './ai-context.service';

const STORAGE_PREFIX = 'mifosXCopilotChats';
const MAX_STORED_CONVERSATIONS = 20;
const MAX_STORED_MESSAGES = 50;

/** Guards against malformed records written by another script or an older version. */
function isConversation(value: unknown): value is Conversation {
  const candidate = value as Conversation | null;
  return (
    !!candidate &&
    typeof candidate === 'object' &&
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    (candidate.messages === undefined || Array.isArray(candidate.messages))
  );
}

/**
 * Orchestrates a conversation: sends user input through sanitize -> gateway ->
 * typed SSE events, maintains the streaming message list, drives the write-
 * approval flow, and persists history to localStorage (server-side history
 * arrives with the gateway's /conversations endpoint).
 *
 * Security invariants (ADR-001):
 *  - every outgoing message passes the InputSanitizer first;
 *  - approvable actions come ONLY from typed action_card events — fenced
 *    ```action_card``` text in model prose is never parsed into a card;
 *  - stopping a stream aborts the underlying request (nothing keeps running);
 *  - all conversation state resets on auth changes so one user's chat can
 *    never leak into (or be archived under) another user's session;
 *  - the wire conversationId is gateway-assigned only — locally minted archive
 *    ids never leave the browser.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  /** Live message list for the active conversation. */
  readonly messages$ = new BehaviorSubject<ChatMessage[]>([]);
  /** Saved conversations for the Recent Chats tab. */
  readonly conversations$ = new BehaviorSubject<Conversation[]>([]);
  /** True while a response is streaming in. */
  readonly isStreaming$ = new BehaviorSubject<boolean>(false);
  /** Write action awaiting the officer's confirmation, if any. */
  readonly pendingAction$ = new BehaviorSubject<PendingAction | null>(null);

  private readonly mcpClientService = inject(McpClientService);
  private readonly contextService = inject(AiContextService);
  private readonly settingsService = inject(SettingsService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly translate = inject(TranslateService);
  private readonly config = inject(COPILOT_CONFIG);

  private readonly sanitizer = new InputSanitizer(this.config.maxInputLength);
  private readonly parser = new ResponseParser();

  private subscription: Subscription | null = null;
  /** Gateway-assigned conversation id — set ONLY from 'done' events, sent on the wire. */
  private wireConversationId?: string;
  /** Local id used for the Recent Chats archive — never sent to the gateway. */
  private archiveId?: string;
  /** Pending action backed up during a decision, restored if the decision fails retryably. */
  private decisionBackup: PendingAction | null = null;
  private seq = 0;

  constructor() {
    // Root-singleton services outlive logins: wipe all conversation state whenever the
    // authenticated user changes, so user A's chat never leaks into user B's session.
    this.authenticationService.isAuthenticated$.pipe(distinctUntilChanged()).subscribe((loggedIn) => {
      const previousKey = this.storageKey();
      this.reset();
      if (loggedIn) {
        this.loadHistory();
      } else {
        // Transcripts hold client names and loan ids. Do not leave them on a shared
        // branch machine after logout.
        this.clearPersistedHistory(previousKey);
      }
    });
  }

  /** Send a user message and stream the assistant reply. */
  sendMessage(content: string): void {
    if (this.isStreaming$.value) {
      return;
    }
    const result = this.sanitizer.sanitize(content ?? '');
    if (result.blocked || !result.text) {
      this.pushMessage({
        id: this.nextId(),
        role: 'assistant',
        content: this.translate.instant(
          result.reason === 'injection_detected' ? 'copilot.errors.injectionBlocked' : 'copilot.errors.invalidLength'
        ),
        timestamp: Date.now()
      });
      return;
    }

    // A new turn supersedes any card still awaiting confirmation.
    this.pendingAction$.next(null);
    this.decisionBackup = null;

    const context = { ...this.contextService.getContextSnapshot(), backendOrigin: this.backendOrigin() };
    this.pushMessage({
      id: this.nextId(),
      role: 'user',
      content: result.text,
      timestamp: Date.now(),
      clientId: context.clientId
    });

    this.startStream(
      this.mcpClientService.chat({
        conversationId: this.wireConversationId,
        message: result.text,
        clientMsgId: this.clientMsgId(),
        context
      })
    );
  }

  /** Approve or reject the pending write action; the reply continues streaming. */
  decideAction(decision: 'approve' | 'reject'): void {
    const pending = this.pendingAction$.value;
    if (!pending || this.isStreaming$.value) {
      return;
    }
    // Back the card up: if the decision fails retryably (e.g. auth expired), it is
    // restored so the officer can decide again instead of losing the action.
    this.decisionBackup = pending;
    this.pendingAction$.next(null);
    this.startStream(this.mcpClientService.decision(pending.cardId, decision, this.clientMsgId()));
  }

  /** Cancel an in-flight streaming response (aborts the underlying request). */
  stopStreaming(): void {
    if (!this.isStreaming$.value) {
      return;
    }
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.finalizeDraft();
  }

  /** Start a fresh conversation, archiving the current one. */
  clearChat(): void {
    this.stopStreaming();
    this.archiveCurrentConversation();
    this.messages$.next([]);
    this.pendingAction$.next(null);
    this.decisionBackup = null;
    this.wireConversationId = undefined;
    this.archiveId = undefined;
  }

  /** Load persisted conversations for the current user + tenant. */
  loadHistory(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      // localStorage is writable by any script on the origin and by older versions of
      // this feature, so validate each record instead of trusting the array.
      this.conversations$.next(Array.isArray(parsed) ? parsed.filter(isConversation) : []);
    } catch {
      this.conversations$.next([]);
    }
  }

  /** Reopen a saved conversation. */
  openConversation(conversation: Conversation): void {
    this.stopStreaming();
    this.archiveCurrentConversation();
    this.messages$.next(conversation.messages ?? []);
    this.pendingAction$.next(null);
    this.decisionBackup = null;
    this.archiveId = conversation.id;
    // Only gateway-issued ids may travel on the wire; local archive ids stay local.
    this.wireConversationId = conversation.id.startsWith('local-') ? undefined : conversation.id;
  }

  /** Remove a saved conversation. */
  deleteConversation(id: string): void {
    const remaining = this.conversations$.value.filter((conversation) => conversation.id !== id);
    this.conversations$.next(remaining);
    this.persistConversations(remaining);
  }

  // ─── Streaming pipeline ────────────────────────────────────────────────────

  private startStream(events: Observable<McpStreamEvent>): void {
    this.isStreaming$.next(true);
    this.pushMessage({
      id: this.nextId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    });

    this.subscription = events.subscribe({
      next: (event) => this.handleEvent(event),
      error: () => {
        this.appendToDraft(`\n\n${this.translate.instant('copilot.errors.streamFailed')}`);
        this.finalizeDraft();
      },
      complete: () => this.finalizeDraft()
    });
  }

  private handleEvent(event: McpStreamEvent): void {
    switch (event.type) {
      case 'token':
        this.appendToDraft(event.token ?? '');
        break;
      case 'tool_call':
        if (event.toolPhase === 'started' && event.toolName) {
          this.updateDraft((draft) => ({ ...draft, toolUsed: event.toolName }));
        }
        break;
      case 'action_card':
        if (event.pendingAction) {
          this.pendingAction$.next(event.pendingAction);
          this.decisionBackup = null;
        } else if (event.card) {
          this.updateDraft((draft) => ({
            ...draft,
            actionCards: [
              ...(draft.actionCards ?? []),
              event.card as ActionCard
            ]
          }));
        }
        break;
      case 'suggest':
        if (event.suggestions?.length) {
          this.updateDraft((draft) => ({ ...draft, suggestedPrompts: event.suggestions }));
        }
        break;
      case 'done':
        if (event.conversationId) {
          this.adoptServerConversationId(event.conversationId);
        }
        this.decisionBackup = null;
        break;
      case 'error':
        this.appendToDraft(
          `${this.draftContent() ? '\n\n' : ''}${event.message ?? this.translate.instant('copilot.errors.streamFailed')}`
        );
        // Restore the card ONLY on AUTH_EXPIRED — the one code the gateway pairs with a
        // server-side card restore. Restoring on other retryable errors (e.g. the LLM
        // summarization failing AFTER a successful write) would offer the officer a dead
        // card and manufacture doubt about whether the action executed.
        if (event.errorCode === 'AUTH_EXPIRED' && this.decisionBackup && !this.pendingAction$.value) {
          this.pendingAction$.next(this.decisionBackup);
          this.decisionBackup = null;
        }
        break;
    }
  }

  /**
   * Close out the streaming draft: extract fenced ```suggest``` follow-ups
   * (kept per ADR-001) — any fenced action_card text stays as plain prose and
   * is deliberately NOT turned into an approvable card.
   */
  private finalizeDraft(): void {
    this.updateDraft((draft) => {
      const suggestions = draft.suggestedPrompts?.length
        ? draft.suggestedPrompts
        : this.parser.parseSuggestions(draft.content);
      const content = draft.content
        .replace(/```suggest\s*[\s\S]*?```/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      return {
        ...draft,
        content,
        suggestedPrompts: suggestions.length ? suggestions : undefined,
        isStreaming: false
      };
    });
    this.dropEmptyDraft();
    this.isStreaming$.next(false);
    this.subscription = null;
    this.archiveCurrentConversation();
  }

  /**
   * A turn that paused at a confirmation card (or errored before any token) leaves an
   * assistant message with nothing in it — remove it so no empty bubble ever renders.
   */
  private dropEmptyDraft(): void {
    const messages = this.messages$.value;
    const last = messages[messages.length - 1];
    if (
      last?.role === 'assistant' &&
      !last.content.trim() &&
      !last.actionCards?.length &&
      !last.suggestedPrompts?.length
    ) {
      this.messages$.next(messages.slice(0, -1));
    }
  }

  /** Full wipe on auth changes — aborts any stream WITHOUT archiving (wrong user's key). */
  private reset(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.isStreaming$.next(false);
    this.messages$.next([]);
    this.conversations$.next([]);
    this.pendingAction$.next(null);
    this.decisionBackup = null;
    this.wireConversationId = undefined;
    this.archiveId = undefined;
  }

  // ─── Message-list helpers (immutable updates for change detection) ────────

  private pushMessage(message: ChatMessage): void {
    this.messages$.next([
      ...this.messages$.value,
      message
    ]);
  }

  private updateDraft(mutate: (draft: ChatMessage) => ChatMessage): void {
    const messages = this.messages$.value;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') {
      return;
    }
    this.messages$.next([
      ...messages.slice(0, -1),
      mutate(last)
    ]);
  }

  private appendToDraft(text: string): void {
    if (!text) {
      return;
    }
    this.updateDraft((draft) => ({ ...draft, content: draft.content + text }));
  }

  private draftContent(): string {
    const messages = this.messages$.value;
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' ? last.content : '';
  }

  // ─── History persistence (localStorage; gateway sync arrives later) ───────

  /** The gateway issued the real id — migrate any local archive record onto it. */
  private adoptServerConversationId(serverId: string): void {
    this.wireConversationId = serverId;
    if (this.archiveId && this.archiveId !== serverId && this.archiveId.startsWith('local-')) {
      const remaining = this.conversations$.value.filter((existing) => existing.id !== this.archiveId);
      this.conversations$.next(remaining);
    }
    this.archiveId = serverId;
  }

  private archiveCurrentConversation(): void {
    const messages = this.messages$.value;
    const firstUserMessage = messages.find((message) => message.role === 'user');
    if (!firstUserMessage) {
      return; // Nothing worth saving.
    }
    // Archive id is local bookkeeping only; it must NEVER flow into wireConversationId.
    const id = this.archiveId ?? this.wireConversationId ?? `local-${firstUserMessage.timestamp}`;
    this.archiveId = id;
    const lastMessage = messages[messages.length - 1];
    const conversation: Conversation = {
      id,
      title: this.truncate(firstUserMessage.content, 48),
      preview: this.truncate(lastMessage?.content ?? '', 80),
      timestamp: Date.now(),
      messageCount: messages.length,
      messages: messages.slice(-MAX_STORED_MESSAGES)
    };
    const others = this.conversations$.value.filter((existing) => existing.id !== id);
    const updated = [
      conversation,
      ...others
    ].slice(0, MAX_STORED_CONVERSATIONS);
    this.conversations$.next(updated);
    this.persistConversations(updated);
  }

  private persistConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(conversations));
    } catch {
      // Storage full/unavailable: history quietly degrades to in-memory.
    }
  }

  /** Drop the on-device transcript for a session that has ended. */
  private clearPersistedHistory(storageKey: string): void {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Storage unavailable: nothing persisted, nothing to clear.
    }
  }

  /** History is namespaced per tenant + user so shared machines never mix chats. */
  private storageKey(): string {
    const tenant = this.settingsService.tenantIdentifier || environment.fineractPlatformTenantId || 'default';
    const user = this.authenticationService.getCredentials()?.username || 'anonymous';
    return `${STORAGE_PREFIX}:${tenant}:${user}`;
  }

  /** Origin of the Fineract this UI session talks to (user-switchable server selector). */
  private backendOrigin(): string | undefined {
    try {
      const server = this.settingsService.server || environment.baseApiUrl;
      return server ? new URL(server).origin : undefined;
    } catch {
      return undefined;
    }
  }

  private truncate(text: string, max: number): string {
    const clean = (text ?? '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
  }

  private nextId(): string {
    this.seq += 1;
    return `m-${Date.now()}-${this.seq}`;
  }

  private clientMsgId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
