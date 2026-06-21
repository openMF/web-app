/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { ChatMessage } from '../../core/models/chat-message.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ActionCardComponent } from '../action-card/action-card.component';
import { QuickChipsComponent } from '../quick-chips/quick-chips.component';

/** Scrollable chat body: welcome state, message bubbles, cards, typing indicator. */
@Component({
  selector: 'mifosx-chat-area',
  imports: [
    CommonModule,
    TranslateModule,
    MarkdownPipe,
    ActionCardComponent,
    QuickChipsComponent
  ],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.scss']
})
export class ChatAreaComponent {
  @Input() messages: ChatMessage[] = [];
  @Input() isStreaming = false;
  @Input() greetingTime = '';
  @Input() emptySuggestions: string[] = [];

  @Output() promptSelected = new EventEmitter<string>();
  @Output() cardAction = new EventEmitter<string | undefined>();
  @Output() cardRoute = new EventEmitter<string | undefined>();

  trackByMessageId(_index: number, msg: ChatMessage): string {
    return msg.id;
  }

  /** Relative time via moment (localizes with the active moment locale). */
  relativeTime(timestamp: number): string {
    return moment(timestamp).fromNow();
  }
}
