/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  ViewChild,
  ViewEncapsulation,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { CopilotExportService } from '../../services/copilot-export.service';

/** Child components */
import { CopilotHeaderComponent } from '../copilot-header/copilot-header.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { RecentChatsComponent } from '../recent-chats/recent-chats.component';
import { InputBarComponent } from '../input-bar/input-bar.component';
import { CopilotPreferencesComponent } from '../copilot-preferences/copilot-preferences.component';
import { PromptNavComponent } from '../prompt-nav/prompt-nav.component';
import { InputBarComponent as InputBar } from '../input-bar/input-bar.component';

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
    InputBarComponent,
    CopilotPreferencesComponent,
    PromptNavComponent
  ],
  templateUrl: './copilot-panel.component.html',
  styleUrls: ['./copilot-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
// Deliberately no ngOnInit. The shell creates this panel as soon as the feature is on,
// which can be before the officer's credentials are written, and reading the transcript
// then would list the previous officer's conversations. Recent Chats loads when it opens.
export class CopilotPanelComponent {
  private readonly featureService = inject(CopilotFeatureService);
  private readonly translate = inject(TranslateService);
  private readonly chatService = inject(ChatService);
  private readonly contextService = inject(AiContextService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly exportService = inject(CopilotExportService);
  private readonly snackBar = inject(MatSnackBar);

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
  /**
   * Whether the panel fills the window rather than sitting framed inside the shell.
   *
   * <p>Restored from the last time. An officer who works this way works this way all day, and
   * having to say so on every open is its own annoyance.
   */
  isFullScreen = CopilotPanelComponent.readFullScreenPreference();
  /**
   * What is currently typed in the composer.
   *
   * <p>Held here rather than in the input bar so it survives a question the gateway or the
   * sanitiser refuses: emptying it on every send meant complaining about text the officer
   * could no longer read.
   */
  composerText = '';

  /** Layout flags supplied by the host shell. */
  @Input() sidenavCollapsed = true;
  @Input() isHandset = false;

  /** Conversation state, mirrored from ChatService. */
  messages: ChatMessage[] = [];
  /** The question whose answer is on screen, mirrored for the prompt rail. */
  activeQuestionId: string | null = null;

  @ViewChild(ChatAreaComponent) private chatArea?: ChatAreaComponent;
  @ViewChild(InputBar) private inputBar?: InputBar;
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
  // and streaming callbacks arrive outside a template event, and without it an OnPush ancestor
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

  /**
   * Recent Chats is read at the moment it is shown rather than when the session starts.
   * A login is announced before the new credentials are written, so anything loaded on
   * that event would belong to whoever was signed in a moment earlier.
   */
  private refreshHistory(): void {
    this.chatService.loadHistory();
  }

  /**
   * Whether conversations are kept on this device between sessions.
   *
   * <p>Read from the service rather than copied into a field. This panel is created
   * before the officer's credentials are written, so there is no early moment at which
   * a copy would be correct.
   */
  get historyEnabled(): boolean {
    return this.chatService.historyEnabled();
  }

  /** Keep conversations on this device between sessions, or stop and erase what is there. */
  setHistoryEnabled(enabled: boolean): void {
    this.chatService.setHistoryEnabled(enabled);
  }

  /** Erase every saved conversation for this officer on this machine. */
  clearAllHistory(): void {
    this.chatService.clearAllHistory();
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

  /**
   * Keyboard shortcuts, active only while the panel is open.
   *
   * <p>Bound on the document because the panel is an overlay the officer may not have focused,
   * and every branch of this returns early unless the panel is open, so nothing here changes
   * how the rest of the application behaves.
   */
  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    if (!this.isEnabled || !this.isOpen || this.activeTab !== 'chat') {
      return;
    }
    const target = event.target as HTMLElement | null;
    const typing =
      !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable === true);

    // "/" jumps to the composer, the convention almost every chat application uses. Never
    // while the officer is typing, where it is just a slash.
    if (event.key === '/' && !typing) {
      event.preventDefault();
      this.inputBar?.focusInput();
      return;
    }
    // Alt+Up / Alt+Down move between the questions asked this session. Alt, because the
    // arrows alone belong to the composer and to the scroll container.
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      this.stepThroughQuestions(event.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    // Escape closes the panel, but only from outside the composer, where it stops the reply.
    if (event.key === 'Escape' && !typing && !this.isStreaming) {
      event.preventDefault();
      this.togglePanel();
    }
  }

  /** Move to the question before or after the one on screen, and stop at the ends. */
  private stepThroughQuestions(direction: -1 | 1): void {
    const questions = this.messages.filter((message) => message.role === 'user');
    if (questions.length === 0) {
      return;
    }
    const current = questions.findIndex((message) => message.id === this.activeQuestionId);
    // From nowhere in particular, Up goes to the last question and Down to the first.
    const from = current < 0 ? (direction === -1 ? questions.length : -1) : current;
    const next = Math.min(Math.max(from + direction, 0), questions.length - 1);
    this.jumpToQuestion(questions[next].id);
  }

  /** Put the last question back in the composer to be reworded. */
  editLastQuestion(): void {
    const question = this.chatService.editLastQuestion();
    if (question === null) {
      return;
    }
    this.composerText = question;
    this.inputBar?.focusInput();
  }

  /** The rail asked to go back to a question. */
  jumpToQuestion(id: string): void {
    this.activeQuestionId = id;
    this.chatArea?.scrollToQuestion(id);
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  switchTab(tab: CopilotTab): void {
    this.activeTab = tab;
    if (tab === 'recent') {
      this.refreshHistory();
    }
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
    if (this.chatService.sendMessage(content)) {
      this.composerText = '';
    }
  }

  /**
   * Suggestion chips and help prompts pass a translation key (or, for assistant
   * follow-ups, plain text). Translate it so the actual prompt text is sent;
   * TranslateService returns the input unchanged when it is not a known key.
   */
  sendSuggestedPrompt(promptKey: string): void {
    this.sendMessage(this.translate.instant(promptKey));
  }

  /**
   * Send a question that failed, again, exactly as the officer wrote it.
   *
   * <p>Not through the suggested-prompt path: that translates its argument, which is right
   * for a chip naming a translation key and wrong for something a person typed, where a full
   * stop would be read as nesting.
   */
  retryPrompt(prompt: string): void {
    this.sendMessage(prompt);
  }

  /** Put the question behind a reply again. */
  repeatMessage(messageId: string): void {
    this.chatService.repeat(messageId);
  }

  /** Keep what the officer made of a reply. */
  rateMessage(rating: { messageId: string; vote: 'up' | 'down' | null }): void {
    this.chatService.setVote(rating.messageId, rating.vote);
  }

  /** File an exchange as a PDF. */
  async exportExchange(messageId: string): Promise<void> {
    const exchange = this.chatService.exchangeFor(messageId);
    if (!exchange) {
      return;
    }
    try {
      await this.exportService.exportToPdf({
        ...exchange,
        askedBy: this.authenticationService.getCredentials()?.username,
        clientName: this.contextService.getContextSnapshot().clientName
      });
    } catch {
      // Rendering the page is the only thing that can fail here, and silence would look
      // exactly like a browser that blocked the download.
      this.notify('copilot.export.failed');
    }
  }

  /** Pass an exchange on, through the officer's own share sheet where there is one. */
  async shareExchange(messageId: string): Promise<void> {
    const exchange = this.chatService.exchangeFor(messageId);
    if (!exchange) {
      return;
    }
    const outcome = await this.exportService.share({
      ...exchange,
      clientName: this.contextService.getContextSnapshot().clientName
    });
    // A share sheet the officer dismissed needs no announcement; a silent clipboard write
    // does, because nothing else on screen changes.
    if (outcome === 'copied') {
      this.notify('copilot.export.copiedToClipboard');
    }
  }

  private notify(key: string): void {
    this.snackBar.open(this.translate.instant(key), undefined, { duration: 4000 });
  }

  /**
   * Fill the window, or stop.
   *
   * <p>Room is the point. A confirmation card at the end of a long conversation can sit below
   * the fold in the framed panel, and a repayment schedule is a wide table in a column built
   * for prose.
   */
  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    try {
      localStorage.setItem(CopilotPanelComponent.FULL_SCREEN_KEY, String(this.isFullScreen));
    } catch {
      // Storage unavailable: the choice holds for this session and is forgotten after it.
    }
  }

  private static readonly FULL_SCREEN_KEY = 'mifosXCopilotFullScreen';

  private static readFullScreenPreference(): boolean {
    try {
      return localStorage.getItem(CopilotPanelComponent.FULL_SCREEN_KEY) === 'true';
    } catch {
      return false;
    }
  }

  stopStreaming(): void {
    this.chatService.stopStreaming();
  }

  /** Officer confirmed the pending write, so the gateway executes it now. */
  confirmPendingAction(): void {
    this.chatService.decideAction('approve');
  }

  /** Officer rejected the pending write, so nothing executes. */
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

  /**
   * Build the card the officer reads before money moves.
   *
   * The gateway sends ready-to-read rows: it looked the account up first, so the card can
   * say "Client: Aisha Bello / Loan account: 000000012 / Approved amount: USD 28,000.00"
   * rather than echoing back the arguments the model produced. Falling back to those raw
   * arguments only matters against a gateway too old to send rows.
   */
  private toConfirmationCard(pending: PendingAction): ActionCard {
    const data: Record<string, string> = {};
    for (const row of pending.display ?? []) {
      data[row.label] = row.value;
    }
    if (Object.keys(data).length === 0) {
      for (const [
        key,
        value
      ] of Object.entries(pending.args ?? {})) {
        if (value == null || String(value).trim().length === 0) {
          continue;
        }
        data[this.humanizeKey(key)] = typeof value === 'object' ? JSON.stringify(value) : String(value);
      }
    }
    if (pending.idempotencyKey) {
      // A short reference reads like the receipt number on a teller slip; the gateway keeps
      // the full key for the audit trail.
      data[this.translate.instant('copilot.confirm.reference')] = pending.idempotencyKey.slice(0, 8).toUpperCase();
    }
    return {
      type: 'confirmation',
      title: pending.humanSummary || this.humanizeKey(pending.tool),
      data
    };
  }

  /** Last-resort label: "approvedLoanAmount" reads as "Approved loan amount". */
  private humanizeKey(key: string): string {
    const spaced = key
      .replace(/^mifos_/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  }
}
