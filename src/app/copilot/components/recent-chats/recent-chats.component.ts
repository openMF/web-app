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
import { Conversation } from '../../core/models/chat-message.model';

/** Recent Chats tab: list of saved conversations with preview, meta and delete. */
@Component({
  selector: 'mifosx-recent-chats',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './recent-chats.component.html',
  styleUrls: ['./recent-chats.component.scss']
})
export class RecentChatsComponent {
  @Input() conversations: Conversation[] = [];
  @Output() open = new EventEmitter<Conversation>();
  @Output() remove = new EventEmitter<{ event: Event; id: string }>();

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.remove.emit({ event, id });
  }

  trackByConversationId(_index: number, conv: Conversation): string {
    return conv.id;
  }

  /** Relative time via moment (localizes with the active moment locale). */
  relativeTime(timestamp: number): string {
    return moment(timestamp).fromNow();
  }
}
