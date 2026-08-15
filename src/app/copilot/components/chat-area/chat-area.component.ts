/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ChatMessage } from '../../core/models/chat-message.model';
import { ActionCard } from '../../core/models/action-card.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ActionCardComponent } from '../action-card/action-card.component';
import { ConfirmationCardComponent } from '../confirmation-card/confirmation-card.component';
import { QuickChipsComponent } from '../quick-chips/quick-chips.component';

/** Scrollable chat body: welcome state, message bubbles, cards, typing indicator. */
@Component({
  selector: 'mifosx-chat-area',
  imports: [
    CommonModule,
    TranslateModule,
    MarkdownPipe,
    ActionCardComponent,
    ConfirmationCardComponent,
    QuickChipsComponent
  ],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.scss']
})
export class ChatAreaComponent implements OnChanges, AfterViewChecked {
  @Input() messages: ChatMessage[] = [];
  @Input() isStreaming = false;
  @Input() greetingTime = '';
  @Input() emptySuggestions: string[] = [];
  /** Write action awaiting confirmation — rendered INSIDE the chat flow so it scrolls
   *  with the conversation and can never overlap other messages. */
  @Input() pendingCard: ActionCard | null = null;

  @Output() promptSelected = new EventEmitter<string>();
  @Output() cardAction = new EventEmitter<string | undefined>();
  @Output() cardRoute = new EventEmitter<string | undefined>();
  @Output() confirmPending = new EventEmitter<void>();
  @Output() cancelPending = new EventEmitter<void>();

  @ViewChild('messageContainer') private messageContainer?: ElementRef<HTMLElement>;

  /** How close to the bottom (px) still counts as "following the conversation". */
  private static readonly STICK_THRESHOLD_PX = 160;
  private pendingScroll = false;

  /**
   * Auto-follow new content: stick to the bottom while the user is already there
   * (or has just sent a message), but never yank them down while they scrolled
   * up to read history mid-stream.
   */
  ngOnChanges(changes: SimpleChanges): void {
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

  ngAfterViewChecked(): void {
    if (this.pendingScroll && this.messageContainer) {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
      this.pendingScroll = false;
    }
  }

  trackByMessageId(_index: number, msg: ChatMessage): string {
    return msg.id;
  }

  private readonly settingsService = inject(SettingsService);
  private readonly dateUtils = inject(Dates);

  /**
   * Relative time localized to the USER'S CHOSEN app language — resolved per
   * call (instance locale), never trusting moment's global locale, which other
   * pipes mutate as a side effect and may point at a different language.
   */
  relativeTime(timestamp: number): string {
    const locale = this.dateUtils.getMomentLocale(this.settingsService.language);
    return moment(timestamp).locale(locale).fromNow();
  }
}
