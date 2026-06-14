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

  /** Welcome-state greeting. */
  displayName = 'there';

  /** Suggestions shown on the empty state. */
  emptySuggestions: string[] = [
    'Show me details for client John Doe',
    'What is the repayment schedule for loan #107?',
    'Show savings account balance for client #52',
    'How many loans are overdue this week?'
  ];

  private seq = 0;

  get greetingTime(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
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

  sendSuggestedPrompt(prompt: string): void {
    this.sendMessage(prompt);
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
