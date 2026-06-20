/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/** Models */
import { ChatMessage, Conversation } from '../../core/models/chat-message.model';

/** Services */
import { CopilotFeatureService } from '../../services/copilot-feature.service';

/** Child components */
import { CopilotHeaderComponent } from '../copilot-header/copilot-header.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { RecentChatsComponent } from '../recent-chats/recent-chats.component';
import { InputBarComponent } from '../input-bar/input-bar.component';

export type CopilotTab = 'chat' | 'recent' | 'preferences' | 'help';

/**
 * Container / shell for the Copilot. Owns panel state (open, active tab),
 * the message list and conversations, and orchestrates send / stop / clear.
 *
 * Styling: this component carries the entire Copilot stylesheet with
 * ViewEncapsulation.None, scoped under the `.mifos-copilot` root class so it
 * also styles the child components nested in its template without leaking.
 *
 * NOTE: the MCP server is not wired yet - sendMessage() currently produces a
 * mock assistant reply so the UI is demoable. Swap in ChatService once the
 * endpoint contract is finalised.
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
export class CopilotPanelComponent {
  private readonly featureService = inject(CopilotFeatureService);
  private readonly translate = inject(TranslateService);

  /** Master enable check (deployment + role + user preference). */
  isEnabled = this.featureService.shouldShowPanel();
  /** Whether the full-page panel is shown. */
  isOpen = false;
  /** Active bottom-nav tab. */
  activeTab: CopilotTab = 'chat';

  /** Layout flags supplied by the host shell. */
  @Input() sidenavCollapsed = true;
  @Input() isHandset = false;

  /** Conversation state. */
  messages: ChatMessage[] = [];
  conversations: Conversation[] = [];
  isStreaming = false;

  /** Header context label, e.g. "Client: Rajesh Kumar". */
  contextLabel: string | null = null;

  /** Suggestions shown on the empty state (translation keys). */
  emptySuggestions: string[] = [
    'copilot.suggestions.clientDetails',
    'copilot.suggestions.repaymentSchedule',
    'copilot.suggestions.savingsBalance',
    'copilot.suggestions.overdueLoans'
  ];

  private seq = 0;

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
    this.messages = [];
    this.activeTab = 'chat';
  }

  /** Triggered by the input bar / suggestion chips. */
  sendMessage(text: string): void {
    const content = (text ?? '').trim();
    if (!content || this.isStreaming) {
      return;
    }
    this.activeTab = 'chat';
    this.messages = [
      ...this.messages,
      { id: this.nextId(), role: 'user', content, timestamp: Date.now() }
    ];
    this.respondMock(content);
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
    this.isStreaming = false;
  }

  openConversation(conv: Conversation): void {
    this.messages = conv.messages ?? [];
    this.activeTab = 'chat';
  }

  deleteConversation(event: Event, id: string): void {
    event.stopPropagation();
    this.conversations = this.conversations.filter((c) => c.id !== id);
  }

  onActionClick(_action: string | undefined): void {
    // TODO: route write actions through a confirmation dialog + MCP.
  }

  onRouteClick(_route: string | undefined): void {
    // TODO: navigate via Angular Router.
  }

  /** Placeholder reply so the panel is demoable before MCP is connected. */
  private respondMock(userText: string): void {
    this.isStreaming = true;
    const reply: ChatMessage = {
      id: this.nextId(),
      role: 'assistant',
      content: `You asked: **${userText}**\n\nThis is a placeholder reply - the MCP server is not connected yet.`,
      timestamp: Date.now(),
      suggestedPrompts: [
        'Show client portfolio',
        'View overdue loans'
      ]
    };
    this.messages = [
      ...this.messages,
      reply
    ];
    this.isStreaming = false;
  }

  private nextId(): string {
    this.seq += 1;
    return `m-${this.seq}`;
  }
}
