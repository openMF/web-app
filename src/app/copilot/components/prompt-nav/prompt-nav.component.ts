/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChatMessage } from '../../core/models/chat-message.model';

/** Below this many questions the list is more furniture than help. */
export const PROMPT_NAV_MIN_QUESTIONS = 2;

/** How much of a question the rail shows before trimming it. */
const MAX_LABEL_CHARS = 48;

/** One question, as the rail lists it. */
export interface PromptEntry {
  id: string;
  label: string;
  index: number;
}

/**
 * A rail of the questions asked in this session, for getting back to one.
 *
 * <p>A long exchange scrolls past what an officer wants to re-read, and scrolling back through
 * an assistant's paragraphs to find the question that produced them is the tedious part. The
 * rail lists the questions only: they are short, the officer wrote them, and they are what is
 * actually remembered about a conversation.
 *
 * <p>It appears at the second question, because with one there is nothing to move between, and
 * hides itself entirely on a narrow panel where a column of its own would take the space the
 * conversation needs.
 */
@Component({
  selector: 'mifosx-prompt-nav',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './prompt-nav.component.html',
  styleUrls: ['./prompt-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromptNavComponent {
  /**
   * Built from the message list rather than taking it raw, so that a token arriving for the
   * answer does not change anything this component reads.
   */
  @Input() set messages(value: ChatMessage[] | null | undefined) {
    const questions = (value ?? []).filter((message) => message.role === 'user');
    this.entries =
      questions.length < PROMPT_NAV_MIN_QUESTIONS
        ? NO_ENTRIES
        : questions.map((message, index) => ({
            id: message.id,
            label: trim(message.content),
            index: index + 1
          }));
  }

  /** The question whose answer is on screen, so the rail says where the officer is. */
  @Input() activeId: string | null = null;

  @Output() jumpTo = new EventEmitter<string>();

  entries: PromptEntry[] = NO_ENTRIES;

  /** Collapsed to a strip of rules, which keeps the position readable at a glance. */
  collapsed = false;

  get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  trackById(_index: number, entry: PromptEntry): string {
    return entry.id;
  }
}

/** One shared empty array, so "nothing to list" is a stable reference for OnPush. */
const NO_ENTRIES: PromptEntry[] = [];

/**
 * A question, short enough to scan.
 *
 * <p>Cut on a word boundary where there is one within reach of the limit: "Show me the repayme"
 * is harder to recognise than "Show me the…", and recognising it is the whole job.
 */
function trim(text: string): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_LABEL_CHARS) {
    return clean;
  }
  const cut = clean.slice(0, MAX_LABEL_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > MAX_LABEL_CHARS - 12 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
