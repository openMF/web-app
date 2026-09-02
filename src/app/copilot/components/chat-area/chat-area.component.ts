/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { relativeTime } from '../../core/relative-time';
import { ChatMessage } from '../../core/models/chat-message.model';
import { ActionCard } from '../../core/models/action-card.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ActionCardComponent } from '../action-card/action-card.component';
import { ConfirmationCardComponent } from '../confirmation-card/confirmation-card.component';
import { QuickChipsComponent } from '../quick-chips/quick-chips.component';
import { MessageActionsComponent } from '../message-actions/message-actions.component';
import { ThinkingTrailComponent } from '../thinking-trail/thinking-trail.component';

/** Breathing room left above a confirmation card once it is scrolled into view. */
const CARD_TOP_GAP_PX = 12;

/** How long a copy button stays in its confirmed state. */
const COPY_CONFIRM_MS = 1600;

/**
 * How many messages are rendered before the conversation is windowed.
 *
 * <p>Chosen to be comfortably more than fits on a tall screen, so the window is never the
 * reason an officer has to click something. Beyond it, every extra exchange is DOM that is
 * re-checked on every token of the reply being streamed at the bottom.
 *
 * <p>Windowing rather than virtual scrolling on purpose. CdkVirtualScrollViewport only
 * measures fixed-height rows; chat messages are not, and the autosize strategy that handles
 * them lives in cdk-experimental, which this project does not depend on and which would take
 * the anchors that the prompt rail and the auto-follow both scroll to out of the DOM.
 */
const WINDOW_SIZE = 40;

/** Scrollable chat body: welcome state, message bubbles, cards, typing indicator. */
@Component({
  selector: 'mifosx-chat-area',
  imports: [
    CommonModule,
    TranslateModule,
    MarkdownPipe,
    ActionCardComponent,
    ConfirmationCardComponent,
    QuickChipsComponent,
    MessageActionsComponent,
    ThinkingTrailComponent
  ],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAreaComponent implements OnChanges, AfterViewChecked, OnDestroy {
  @Input() messages: ChatMessage[] = [];
  @Input() isStreaming = false;
  @Input() greetingTime = '';
  @Input() emptySuggestions: string[] = [];
  /** Write action awaiting confirmation, rendered INSIDE the chat flow so it scrolls
   *  with the conversation and can never overlap other messages. */
  @Input() pendingCard: ActionCard | null = null;

  @Output() promptSelected = new EventEmitter<string>();
  /** The officer asked to send a failed question again. */
  @Output() retryRequested = new EventEmitter<string>();
  /** The officer asked for the question behind a reply to be put again. Carries its id. */
  @Output() repeatRequested = new EventEmitter<string>();
  /** The officer rated a reply, or took the rating back. */
  @Output() voteChanged = new EventEmitter<{ messageId: string; vote: 'up' | 'down' | null }>();
  /** The officer asked for an exchange as a PDF. Carries the id of the reply. */
  @Output() exportRequested = new EventEmitter<string>();
  /** The officer asked to pass an exchange on. Carries the id of the reply. */
  @Output() shareRequested = new EventEmitter<string>();
  @Output() cardAction = new EventEmitter<string | undefined>();
  @Output() cardRoute = new EventEmitter<string | undefined>();
  @Output() confirmPending = new EventEmitter<void>();
  @Output() cancelPending = new EventEmitter<void>();
  /** Which question's answer is on screen, so the rail can say where the officer is. */
  @Output() visibleQuestionChanged = new EventEmitter<string>();

  @ViewChild('messageContainer') private messageContainer?: ElementRef<HTMLElement>;
  /** The confirmation card, so it can be shown from its top rather than from its buttons. */
  @ViewChild('confirmCard', { read: ElementRef }) private confirmCard?: ElementRef<HTMLElement>;

  /** How close to the bottom (px) still counts as "following the conversation". */
  private static readonly STICK_THRESHOLD_PX = 160;
  private pendingScroll = false;
  /** Last question reported as on screen, so the rail is only told when it changes. */
  private lastVisibleQuestion: string | null = null;
  private scrollFrame = 0;
  /** How many of the most recent messages are rendered. Grows when the officer asks. */
  private revealed = WINDOW_SIZE;
  /** The windowed slice, recomputed when the conversation changes rather than per check. */
  visibleMessages: ChatMessage[] = [];
  /** How many older messages are being held back, for the control that reveals them. */
  hiddenCount = 0;

  /** Render the whole conversation from here on, and say whether anything changed. */
  revealEarlier(): boolean {
    if (this.hiddenCount === 0) {
      return false;
    }
    this.revealed = this.messages.length;
    this.applyWindow();
    return true;
  }

  private applyWindow(): void {
    const total = this.messages.length;
    // Always keep whole exchanges: starting the window on a reply orphans it from its
    // question, which reads as the assistant having spoken unprompted.
    let start = Math.max(0, total - Math.max(this.revealed, WINDOW_SIZE));
    if (start > 0 && this.messages[start]?.role !== 'user') {
      start -= 1;
    }
    this.hiddenCount = Math.max(0, start);
    this.visibleMessages = start === 0 ? this.messages : this.messages.slice(start);
  }

  /**
   * Auto-follow new content: stick to the bottom while the user is already there
   * (or has just sent a message), but never yank them down while they scrolled
   * up to read history mid-stream.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      // A new conversation starts windowed again; a growing one keeps what was revealed.
      if (this.messages.length < this.revealed) {
        this.revealed = WINDOW_SIZE;
      }
      this.applyWindow();
    }
    if (!changes['messages'] && !changes['isStreaming'] && !changes['pendingCard']) {
      return;
    }
    if (changes['pendingCard'] && this.pendingCard) {
      this.pendingScroll = true; // A new confirmation card always scrolls into view.
      return;
    }
    const container = this.messageContainer?.nativeElement;
    const lastIsUser = this.messages[this.messages.length - 1]?.role === 'user';
    const nearBottom = !container
      ? true
      : container.scrollHeight - container.scrollTop - container.clientHeight < ChatAreaComponent.STICK_THRESHOLD_PX;
    this.pendingScroll = nearBottom || lastIsUser;
  }

  ngOnDestroy(): void {
    if (this.scrollFrame) {
      cancelAnimationFrame(this.scrollFrame);
    }
  }

  ngAfterViewChecked(): void {
    if (!this.pendingScroll || !this.messageContainer) {
      return;
    }
    const container = this.messageContainer.nativeElement;
    const card = this.confirmCard?.nativeElement;
    if (card) {
      // Show a confirmation card from its top edge. Scrolling to the bottom of the
      // conversation puts Confirm on screen and pushes the client and the amount above
      // the fold, which is the wrong half of a money decision to hide.
      const offset = card.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTop = Math.max(0, container.scrollTop + offset - CARD_TOP_GAP_PX);
    } else {
      container.scrollTop = container.scrollHeight;
    }
    this.pendingScroll = false;
  }

  /**
   * Whether the reply being streamed has anything on screen yet.
   *
   * <p>Drives the typing indicator away the moment it has served its purpose. A turn that has
   * already written a sentence does not also need three dots below it, and the second avatar
   * that carries them looks like a second assistant.
   */
  get hasVisibleDraft(): boolean {
    const last = this.messages[this.messages.length - 1];
    return !!last && last.role === 'assistant' && !!last.content?.trim();
  }

  /**
   * True once a reply has finished, so the live region can say so exactly once.
   *
   * <p>Paired with the streaming state rather than announced on its own: a region that only
   * ever gains text is re-read by some screen readers, and "reply ready" repeated after every
   * token would be worse than silence.
   */
  get lastReplyDone(): boolean {
    const last = this.messages[this.messages.length - 1];
    return !!last && last.role === 'assistant' && !last.isStreaming && !!last.content?.trim();
  }

  trackByMessageId(_index: number, msg: ChatMessage): string {
    return msg.id;
  }

  private readonly settingsService = inject(SettingsService);
  private readonly dateUtils = inject(Dates);
  private readonly clipboard = inject(Clipboard);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  /**
   * Take the code out of a fenced block.
   *
   * <p>Delegated from the scroll container rather than bound per button, because the blocks are
   * markup built by the markdown renderer and have no template of their own to bind in. One
   * listener also survives a reply being rewritten mid-stream, which per-button listeners
   * would not.
   */
  /**
   * Put a question back on screen, from its top edge.
   *
   * <p>Scrolling it to the middle would be prettier and less useful: what the officer came
   * back for is the answer, and the answer is underneath.
   */
  scrollToQuestion(id: string): void {
    const container = this.messageContainer?.nativeElement;
    if (!container) {
      return;
    }
    let target = container.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
    if (!target) {
      // The question is older than the window. Reveal the rest before going to it, rather
      // than doing nothing and looking broken.
      if (!this.revealEarlier()) {
        return;
      }
      this.cdr.detectChanges();
      target = container.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
    }
    if (!target) {
      return;
    }
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top: Math.max(0, container.scrollTop + offset - CARD_TOP_GAP_PX), behavior: 'smooth' });
  }

  /**
   * Report which question is on screen as the officer scrolls.
   *
   * <p>Coalesced onto an animation frame: a scroll fires far more often than the answer to it
   * can change, and doing this work per event is what makes a long conversation feel heavy.
   */
  onScroll(): void {
    if (this.scrollFrame) {
      return;
    }
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      const container = this.messageContainer?.nativeElement;
      if (!container) {
        return;
      }
      const top = container.getBoundingClientRect().top;
      let current: string | null = null;
      for (const node of Array.from(container.querySelectorAll<HTMLElement>('[data-message-id]'))) {
        // The last question whose top has passed the fold is the one being read.
        if (node.getBoundingClientRect().top - top <= ChatAreaComponent.STICK_THRESHOLD_PX) {
          current = node.dataset['messageId'] ?? null;
        }
      }
      if (current && current !== this.lastVisibleQuestion) {
        this.lastVisibleQuestion = current;
        this.visibleQuestionChanged.emit(current);
      }
    });
  }

  onBodyClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement | null)?.closest?.('[data-copy]') as HTMLElement | null;
    if (!button) {
      return;
    }
    const code = button.closest('.md-code-wrap')?.querySelector('code')?.textContent ?? '';
    if (!code || !this.clipboard.copy(code)) {
      return;
    }
    // Confirm on the button itself. A snackbar for copying two lines of code is more
    // interruption than the act deserves.
    button.classList.add('md-code__copy--done');
    const label = button.getAttribute('aria-label');
    button.setAttribute('aria-label', this.translate.instant('copilot.actions.copied'));
    setTimeout(() => {
      button.classList.remove('md-code__copy--done');
      if (label) {
        button.setAttribute('aria-label', label);
      }
    }, COPY_CONFIRM_MS);
  }

  /** "3 minutes ago", in the language the officer chose. See core/relative-time.ts. */
  relativeTime(timestamp: number): string {
    return relativeTime(timestamp, this.dateUtils.getMomentLocale(this.settingsService.language));
  }
}
