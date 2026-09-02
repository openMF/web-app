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
import { translateStepLabel } from '../core/step-label';
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
 *  - approvable actions come ONLY from typed action_card events, and fenced
 *    ```action_card``` text in model prose is never parsed into a card;
 *  - stopping a stream aborts the underlying request (nothing keeps running);
 *  - conversation state belongs to exactly one tenant+user, and is wiped the
 *    moment that changes, so one officer's chat can never leak into (or be
 *    archived under) another's session;
 *  - the wire conversationId only ever comes from the gateway, so locally minted
 *    archive ids never leave the browser.
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
  /**
   * Gateway-assigned conversation id, sent on the wire. Only ever set from a 'done' event
   * or restored from an archived conversation that carried one; a locally minted archive id
   * never gets in here.
   */
  private wireConversationId?: string;
  /** Local id used for the Recent Chats archive, never sent to the gateway. */
  private archiveId?: string;
  /** The last question sent, so a retryable failure can offer to send it again. */
  private lastPrompt: string | null = null;

  /** When the turn in flight began, for the wall-clock duration the panel shows. */
  private turnStartedAt = 0;

  /** Whether conversations are kept on this device, seeded from the officer's last choice. */
  private historyOn = ChatService.readHistoryPreference();

  /** Pending action backed up during a decision, restored if the decision fails retryably. */
  private decisionBackup: PendingAction | null = null;
  /**
   * Storage key of the officer the in-memory conversation belongs to, or null when nothing
   * is loaded. This is the identity check; the auth service's boolean is only the trigger.
   */
  private stateOwner: string | null = null;
  private seq = 0;

  constructor() {
    // Root-singleton services outlive logins, so this service has to notice when the
    // officer changes. isAuthenticated$ carries a bare boolean and emits true again when
    // one officer logs in directly over another, so it cannot be de-duplicated: every
    // emission wipes state, and storageKey() decides whose history may be read back.
    this.authenticationService.isAuthenticated$.subscribe((loggedIn) => {
      const previousOwner = this.stateOwner;
      this.reset();
      if (loggedIn) {
        // Deliberately no load here. The credentials still name the previous officer at
        // this point, so reading a transcript now would put theirs in front of the new
        // one. State stays unowned until something asks for it, which is late enough.
        return;
      }
      if (previousOwner) {
        // Transcripts hold client names and loan amounts. Do not leave them on a shared
        // branch machine after logout. The key comes from whoever the state belonged to,
        // because logout clears the credentials before it announces itself.
        this.clearPersistedHistory(previousOwner);
      }
    });
  }

  /**
   * Rebind to whoever is signed in now, wiping state that belongs to someone else.
   *
   * The auth service announces a login before it writes the new credentials, so the
   * identity is not yet readable at the moment of the event. Every entry point that
   * touches conversation state checks again here, by which point it is.
   */
  private ensureCurrentUser(): void {
    const key = this.storageKey();
    if (this.stateOwner !== null && this.stateOwner !== key) {
      this.reset();
    }
    if (this.stateOwner === null) {
      this.loadHistory();
    }
  }

  /** Send a user message and stream the assistant reply. */
  /**
   * Send the question that just failed, again.
   *
   * <p>Deliberately the same path as typing it: a chat turn is not idempotent, so a retry is
   * a new turn the officer asked for rather than something the client does behind them.
   */
  retry(prompt: string): void {
    this.sendMessage(prompt);
  }

  /**
   * Ask again the question that produced a given reply.
   *
   * <p>The question is read back out of the conversation rather than remembered separately,
   * so this works on any reply still on screen and not only the most recent one. A write is
   * not repeated by doing this: a write turn stops at a confirmation card, so asking again
   * produces another card to decide on, never a second execution.
   */
  repeat(messageId: string): void {
    const messages = this.messages$.value;
    const index = messages.findIndex((message) => message.id === messageId);
    if (index < 0) {
      return;
    }
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        this.sendMessage(messages[i].content);
        return;
      }
    }
  }

  /**
   * A reply together with the question that produced it, which is the unit worth filing.
   *
   * <p>Returns null for a reply that is no longer on screen rather than a half-populated
   * exchange, so a caller cannot file a page with the wrong question at the top of it.
   */
  exchangeFor(messageId: string): { question: ChatMessage | null; reply: ChatMessage } | null {
    const messages = this.messages$.value;
    const index = messages.findIndex((message) => message.id === messageId);
    if (index < 0) {
      return null;
    }
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return { question: messages[i], reply: messages[index] };
      }
    }
    return { question: null, reply: messages[index] };
  }

  /** Record what the officer made of a reply, or clear it when they take the rating back. */
  setVote(messageId: string, vote: 'up' | 'down' | null): void {
    const messages = this.messages$.value;
    const index = messages.findIndex((message) => message.id === messageId);
    if (index < 0) {
      return;
    }
    const updated = [...messages];
    const { vote: _previous, ...rest } = updated[index];
    updated[index] = vote ? { ...rest, vote } : rest;
    this.messages$.next(updated);
    // The rating belongs to the conversation, so it has to survive closing the panel.
    this.archiveCurrentConversation();
  }

  /**
   * Take back the last exchange and hand the question back for editing.
   *
   * <p>Rephrasing a question is the ordinary way out of a reply that missed the point, and
   * doing it by hand means retyping. The exchange is removed rather than left above the new
   * one, because two answers to nearly the same question is a transcript that invites reading
   * the wrong one.
   *
   * <p>Refused mid-turn: the reply being withdrawn is still arriving, and stopping is a
   * separate, visible act.
   *
   * @returns the question, for the composer; null when there is nothing to take back.
   */
  editLastQuestion(): string | null {
    this.ensureCurrentUser();
    if (this.isStreaming$.value) {
      return null;
    }
    const messages = this.messages$.value;
    const index = messages.map((message) => message.role).lastIndexOf('user');
    if (index < 0) {
      return null;
    }
    // Everything from the question onward goes: the question, its reply, and any card or
    // follow-up that belonged to it.
    this.messages$.next(messages.slice(0, index));
    this.pendingAction$.next(null);
    this.archiveCurrentConversation();
    return messages[index].content;
  }

  /**
   * Send a question.
   *
   * @returns whether it was accepted, so the caller knows whether to empty the composer.
   *   A refusal complains about text the officer can no longer see if it was cleared anyway.
   */
  sendMessage(content: string): boolean {
    this.ensureCurrentUser();
    if (this.isStreaming$.value) {
      return false;
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
      return false;
    }

    // A new turn supersedes any card still awaiting confirmation.
    this.pendingAction$.next(null);
    this.decisionBackup = null;

    const context = { ...this.contextService.getContextSnapshot(), backendOrigin: this.backendOrigin() };
    // Kept so a failure can offer to send it again rather than asking for it to be retyped.
    this.lastPrompt = result.text;
    this.pushMessage({
      id: this.nextId(),
      role: 'user',
      content: result.text,
      timestamp: Date.now(),
      clientId: context.clientId,
      // Recorded now because sharing the answer later should point at the record it came
      // from, and by then the officer may be several screens away.
      contextUrl: this.contextService.currentRoute()
    });

    this.startStream(
      this.mcpClientService.chat({
        conversationId: this.wireConversationId,
        message: result.text,
        clientMsgId: this.clientMsgId(),
        context
      })
    );
    return true;
  }

  /**
   * Add a step to the running record, or close the one already open.
   *
   * <p>Matched on the label rather than the tool name, because the same tool can legitimately
   * be called twice in one turn and each call is its own step in what the officer reads.
   */
  /**
   * What the officer reads when a turn fails.
   *
   * <p>The gateway's own message is preferred, because it knows what went wrong. When there is
   * none the code is turned into copy from the translation files, rather than whatever string
   * the transport happened to throw: "Failed to fetch" is what a blocked CORS preflight, a DNS
   * failure and an unreachable host all look like from the browser, and it tells a loan officer
   * nothing they can act on. The technical detail is logged for whoever is configuring the
   * deployment.
   */
  private errorText(event: McpStreamEvent): string {
    const fromGateway = event.message?.trim();
    if (fromGateway) {
      return fromGateway;
    }
    const key = event.errorCode === 'LLM_UNAVAILABLE' ? 'copilot.errors.timedOut' : 'copilot.errors.streamFailed';
    return this.translate.instant(key);
  }

  private recordStep(event: McpStreamEvent): void {
    // Resolved here rather than in the template: a step log is part of the record of what was
    // done on a client's account, so the wording is fixed at the moment the step happened.
    // Unknown tools fall back to the gateway's own English, which reads better than a
    // missing-translation placeholder (see core/step-label.ts).
    const label = translateStepLabel(event.toolName, event.toolLabel, (key) => this.translate.instant(key));
    if (!label) {
      return;
    }
    this.updateDraft((draft) => {
      const steps = [...(draft.steps ?? [])];
      if (event.toolPhase === 'finished') {
        for (let i = steps.length - 1; i >= 0; i--) {
          if (!steps[i].done) {
            steps[i] = { ...steps[i], label, done: true, durationMs: event.durationMs };
            return { ...draft, steps };
          }
        }
      }
      steps.push({ label, readOnly: event.readOnly !== false, done: event.toolPhase === 'finished' });
      return { ...draft, steps };
    });
  }

  /** Approve or reject the pending write action; the reply continues streaming. */
  decideAction(decision: 'approve' | 'reject'): void {
    this.ensureCurrentUser(); // A card must never be approved under a different login.
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
    this.ensureCurrentUser();
    this.stopStreaming();
    this.archiveCurrentConversation();
    this.messages$.next([]);
    this.pendingAction$.next(null);
    this.decisionBackup = null;
    this.wireConversationId = undefined;
    this.archiveId = undefined;
  }

  /**
   * Whether conversations are kept on this device between sessions.
   *
   * <p>Branch machines are shared, and a transcript naming clients and balances is the kind
   * of thing that should be the officer's decision rather than a default they never saw.
   */
  historyEnabled(): boolean {
    return this.historyOn;
  }

  /**
   * Turn on-device history on or off.
   *
   * <p>Turning it off erases what is already stored rather than only stopping new writes: a
   * setting that leaves yesterday's transcripts on a shared machine has not done what it says.
   * The conversation on screen is untouched, since the officer is still in the middle of it.
   */
  setHistoryEnabled(enabled: boolean): void {
    this.historyOn = enabled;
    try {
      localStorage.setItem(ChatService.HISTORY_OFF_KEY, String(!enabled));
    } catch {
      // Storage unavailable: nothing is being persisted anyway.
    }
    if (!enabled) {
      this.clearAllHistory();
    } else {
      this.archiveCurrentConversation();
    }
  }

  /** Erase every saved conversation for this user, on this device. */
  clearAllHistory(): void {
    this.conversations$.next([]);
    this.clearPersistedHistory(this.storageKey());
  }

  /** Load persisted conversations for the current user + tenant, and bind state to them. */
  loadHistory(): void {
    const key = this.storageKey();
    this.stateOwner = key;
    try {
      const raw = localStorage.getItem(key);
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
    this.ensureCurrentUser();
    if (!this.conversations$.value.some((saved) => saved.id === conversation.id)) {
      return; // Belonged to a previous session; ensureCurrentUser() has already wiped it.
    }
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
    this.ensureCurrentUser();
    const remaining = this.conversations$.value.filter((conversation) => conversation.id !== id);
    this.conversations$.next(remaining);
    this.persistConversations(remaining);
  }

  // ─── Streaming pipeline ────────────────────────────────────────────────────

  private startStream(events: Observable<McpStreamEvent>): void {
    this.isStreaming$.next(true);
    // Stamped here so the panel can say how long the officer waited. Summing the model's timer
    // and each call's duration would count any overlap twice and miss the answer streaming
    // after both, so the turn is measured end to end instead.
    this.turnStartedAt = Date.now();
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
      case 'thinking':
        // Opened lazily by the gateway, so a model with thinking off produces no panel at all
        // rather than an empty one. Nothing to do on start beyond letting the deltas arrive.
        if (event.thinkingPhase === 'delta' && event.thinking) {
          this.updateDraft((draft) => ({
            ...draft,
            workingNotes: (draft.workingNotes ?? '') + event.thinking
          }));
        } else if (event.thinkingPhase === 'end') {
          this.updateDraft((draft) => ({ ...draft, notesElapsedMs: event.thinkingElapsedMs }));
        }
        break;
      case 'tool_call':
        if (event.toolPhase === 'started' && event.toolName) {
          this.updateDraft((draft) => ({ ...draft, toolUsed: event.toolName }));
        }
        this.recordStep(event);
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
        this.appendToDraft(`${this.draftContent() ? '\n\n' : ''}${this.errorText(event)}`);
        // The gateway has already worked out whether waiting will help. Offer the question
        // back when it will, so a rate limit costs a click instead of retyping.
        if (event.retryable && this.lastPrompt) {
          this.updateDraft((draft) => ({ ...draft, retryPrompt: this.lastPrompt ?? undefined }));
        }
        // Restore the card ONLY on AUTH_EXPIRED, the one code the gateway pairs with a
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
   * (kept per ADR-001), so any fenced action_card text stays as plain prose and
   * is deliberately NOT turned into an approvable card.
   */
  private finalizeDraft(): void {
    const turnMs = this.turnStartedAt ? Date.now() - this.turnStartedAt : undefined;
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
        turnMs,
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
   * assistant message with nothing in it, so remove it and no empty bubble ever renders.
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

  /** Full wipe on auth changes, aborting any stream WITHOUT archiving (wrong user's key). */
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
    this.stateOwner = null;
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

  /** The gateway issued the real id, so migrate any local archive record onto it. */
  private adoptServerConversationId(serverId: string): void {
    this.wireConversationId = serverId;
    if (this.archiveId && this.archiveId !== serverId && this.archiveId.startsWith('local-')) {
      const remaining = this.conversations$.value.filter((existing) => existing.id !== this.archiveId);
      this.conversations$.next(remaining);
    }
    this.archiveId = serverId;
  }

  private archiveCurrentConversation(): void {
    if (!this.historyOn) {
      // Gated here rather than at the write, so Recent Chats and the count in Preferences
      // agree with the setting instead of listing conversations that are not being kept.
      return;
    }
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

  private static readonly HISTORY_OFF_KEY = 'mifosXCopilotHistoryOff';

  /**
   * Read once and then held.
   *
   * <p>Every archived turn asks this question, and storage is not free; more to the point, a
   * setting that is re-read on each write can disagree with itself part way through a
   * conversation if anything else on the origin touches the key.
   */
  private static readHistoryPreference(): boolean {
    try {
      return localStorage.getItem(ChatService.HISTORY_OFF_KEY) !== 'true';
    } catch {
      return true; // Cannot ask, so behave as the default says.
    }
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
