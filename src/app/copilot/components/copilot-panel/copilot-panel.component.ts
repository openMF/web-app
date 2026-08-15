/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/** Models */
import { ChatMessage, Conversation } from '../../core/models/chat-message.model';
import { ActionCard } from '../../core/models/action-card.model';
import { PendingAction } from '../../core/models/mcp-response.model';

/** Services */
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { CopilotFeatureService } from '../../services/copilot-feature.service';
import { ChatService } from '../../services/chat.service';
import { AiContextService } from '../../services/ai-context.service';

/** Child components */
import { CopilotHeaderComponent } from '../copilot-header/copilot-header.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { RecentChatsComponent } from '../recent-chats/recent-chats.component';
import { InputBarComponent } from '../input-bar/input-bar.component';

export type CopilotTab = 'chat' | 'recent' | 'preferences' | 'help';

/**
 * Container / shell for the Copilot. Owns panel state (open, active tab) and
 * delegates the conversation to ChatService: sanitize -> gateway SSE -> typed
 * events, including the mandatory human confirmation before any write.
 *
 * Styling: this component carries the entire Copilot stylesheet with
 * ViewEncapsulation.None, scoped under the `.mifos-copilot` root class so it
 * also styles the child components nested in its template without leaking.
 */
@Component({
  selector: 'mifosx-copilot-panel',
  imports: [
    CommonModule,
    TranslateModule,
    CopilotHeaderComponent,
    ChatAreaComponent,
    RecentChatsComponent,
    InputBarComponent
  ],
  templateUrl: './copilot-panel.component.html',
  styleUrls: ['./copilot-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CopilotPanelComponent implements OnInit {
  private readonly featureService = inject(CopilotFeatureService);
  private readonly translate = inject(TranslateService);
  private readonly chatService = inject(ChatService);
  private readonly contextService = inject(AiContextService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  /**
   * Master enable check (deployment + role + user preference). Re-evaluated whenever
   * the authentication state changes: the shell can create this panel before the
   * credentials (and therefore the permissions) are available, and a once-only check
   * would leave the panel hidden until a page reload.
   */
  isEnabled = this.featureService.shouldShowPanel();
  /** Whether the full-page panel is shown. */
  isOpen = false;
  /** Active bottom-nav tab. */
  activeTab: CopilotTab = 'chat';

  /** Layout flags supplied by the host shell. */
  @Input() sidenavCollapsed = true;
  @Input() isHandset = false;

  /** Conversation state, mirrored from ChatService. */
  messages: ChatMessage[] = [];
  conversations: Conversation[] = [];
  isStreaming = false;
  /** Write action awaiting confirmation, rendered as a confirmation card. */
  pendingCard: ActionCard | null = null;

  /** Header context label, e.g. "Client: Rajesh Kumar". */
  contextLabel: string | null = null;

  /** Suggestions shown on the empty state (translation keys). */
  emptySuggestions: string[] = [
    'copilot.suggestions.clientDetails',
    'copilot.suggestions.repaymentSchedule',
    'copilot.suggestions.savingsBalance',
    'copilot.suggestions.overdueLoans'
  ];

  // markForCheck() on every mirror update: this panel is created dynamically by the shell,
  // and streaming callbacks arrive outside a template event — without it, an OnPush ancestor
  // chain would never repaint the incoming tokens.
  constructor() {
    const cdr = inject(ChangeDetectorRef);
    this.chatService.messages$.pipe(takeUntilDestroyed()).subscribe((messages) => {
      this.messages = messages;
      cdr.markForCheck();
    });
    this.chatService.conversations$.pipe(takeUntilDestroyed()).subscribe((conversations) => {
      this.conversations = conversations;
      cdr.markForCheck();
    });
    this.chatService.isStreaming$.pipe(takeUntilDestroyed()).subscribe((streaming) => {
      this.isStreaming = streaming;
      cdr.markForCheck();
    });
    this.chatService.pendingAction$.pipe(takeUntilDestroyed()).subscribe((pending) => {
      this.pendingCard = pending ? this.toConfirmationCard(pending) : null;
      cdr.markForCheck();
    });
    this.contextService.context$
      .pipe(startWith(this.contextService.getContextSnapshot()), takeUntilDestroyed())
      .subscribe((context) => {
        this.contextLabel = context.clientName;
        cdr.markForCheck();
      });
    this.authenticationService.isAuthenticated$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.isEnabled = this.featureService.shouldShowPanel();
      cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.chatService.loadHistory();
  }

  /** Returns the translation key for the time-of-day greeting. */
  get greetingTime(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'copilot.greeting.morning';
    }
    if (hour < 17) {
      return 'copilot.greeting.afternoon';
    }
    return 'copilot.greeting.evening';
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  switchTab(tab: CopilotTab): void {
    this.activeTab = tab;
  }

  clearChat(): void {
    this.chatService.clearChat();
    this.activeTab = 'chat';
  }

  /** Triggered by the input bar / suggestion chips. */
  sendMessage(text: string): void {
    const content = (text ?? '').trim();
    if (!content || this.isStreaming) {
      return;
    }
    this.activeTab = 'chat';
    this.chatService.sendMessage(content);
  }

  /**
   * Suggestion chips and help prompts pass a translation key (or, for assistant
   * follow-ups, plain text). Translate it so the actual prompt text is sent;
   * TranslateService returns the input unchanged when it is not a known key.
   */
  sendSuggestedPrompt(promptKey: string): void {
    this.sendMessage(this.translate.instant(promptKey));
  }

  stopStreaming(): void {
    this.chatService.stopStreaming();
  }

  /** Officer confirmed the pending write — the gateway executes it now. */
  confirmPendingAction(): void {
    this.chatService.decideAction('approve');
  }

  /** Officer rejected the pending write — nothing executes. */
  cancelPendingAction(): void {
    this.chatService.decideAction('reject');
  }

  openConversation(conversation: Conversation): void {
    this.chatService.openConversation(conversation);
    this.activeTab = 'chat';
  }

  deleteConversation(event: Event, id: string): void {
    event.stopPropagation();
    this.chatService.deleteConversation(id);
  }

  /** Card buttons carry a follow-up prompt; send it as a normal message. */
  onActionClick(action: string | undefined): void {
    if (action) {
      this.sendMessage(action);
    }
  }

  /**
   * Card buttons may deep-link into the app (e.g. "Open client profile"). The panel
   * closes so the officer actually SEES the page they navigated to; the conversation
   * is preserved and one click on the bubble brings it back.
   */
  onRouteClick(route: string | undefined): void {
    if (route) {
      this.router.navigateByUrl(route);
      this.isOpen = false;
    }
  }

  /** Flatten the pending action into the confirmation card the officer reviews. */
  private toConfirmationCard(pending: PendingAction): ActionCard {
    const data: Record<string, string> = {};
    for (const [
      key,
      value
    ] of Object.entries(pending.args ?? {})) {
      data[key] = value != null && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    }
    if (pending.idempotencyKey) {
      data[this.translate.instant('copilot.confirm.reference')] = pending.idempotencyKey;
    }
    return {
      type: 'confirmation',
      title: pending.humanSummary || pending.tool,
      data
    };
  }
}
