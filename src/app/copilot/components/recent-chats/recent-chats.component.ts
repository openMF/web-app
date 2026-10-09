/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { Conversation } from '../../core/models/chat-message.model';
import { relativeTime } from '../../core/relative-time';

/** One shared empty array, so "nothing saved" is a stable reference for OnPush. */
const NO_CONVERSATIONS: Conversation[] = [];

/**
 * Lowercased and stripped of accents, so a search matches what was meant rather than what was
 * typed. NFD splits an accented letter into the letter and its mark; the mark is then dropped.
 */
function fold(text: string): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Recent Chats tab: list of saved conversations with preview, meta and delete. */
@Component({
  selector: 'mifosx-recent-chats',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './recent-chats.component.html',
  styleUrls: ['./recent-chats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentChatsComponent {
  /**
   * Saved conversations, kept in a field so the filter has something to filter.
   *
   * <p>Held rather than piped through a template expression, because a filter recomputed on
   * every check is exactly the kind of work an OnPush component is here to avoid.
   */
  @Input()
  set conversations(value: Conversation[] | null | undefined) {
    this.all = value ?? NO_CONVERSATIONS;
    this.applyFilter();
  }
  get conversations(): Conversation[] {
    return this.all;
  }
  private all: Conversation[] = NO_CONVERSATIONS;
  @Output() open = new EventEmitter<Conversation>();
  @Output() remove = new EventEmitter<{ event: Event; id: string }>();

  /** What the officer typed into the search box. */
  query = '';
  /** The conversations that match it, which is all of them until something is typed. */
  visible: Conversation[] = NO_CONVERSATIONS;

  /**
   * Search across the saved conversations.
   *
   * <p>Matches the title and the preview, which between them carry the question that opened
   * the conversation. Case- and accent-insensitive, because an officer searching for "prestamo"
   * should find "préstamo" — a search that only matches perfectly typed accents is a search
   * most people conclude is broken.
   */
  onSearch(query: string): void {
    this.query = query;
    this.applyFilter();
  }

  clearSearch(): void {
    this.onSearch('');
  }

  get hasQuery(): boolean {
    return this.query.trim().length > 0;
  }

  private applyFilter(): void {
    const needle = fold(this.query);
    this.visible = needle
      ? this.all.filter(
          (conversation) => fold(conversation.title).includes(needle) || fold(conversation.preview).includes(needle)
        )
      : this.all;
  }

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.remove.emit({ event, id });
  }

  trackByConversationId(_index: number, conv: Conversation): string {
    return conv.id;
  }

  private readonly settingsService = inject(SettingsService);
  private readonly dateUtils = inject(Dates);

  /** "3 minutes ago", in the language the officer chose rather than whichever one a date pipe set last. */
  relativeTime(timestamp: number): string {
    return relativeTime(timestamp, this.dateUtils.getMomentLocale(this.settingsService.language));
  }
}
