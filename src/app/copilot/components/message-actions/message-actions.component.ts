/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { ChatMessage } from '../../core/models/chat-message.model';
import { toPlainText } from '../../core/plain-text';

/**
 * What an officer can do with a reply once it has finished arriving.
 *
 * <p>Until now a reply was something to read and nothing else. An officer who wanted it in a
 * case note selected it by hand, and one who found it wrong had nowhere to say so. These are
 * the four things that need no server: take it, ask again, and rate it either way.
 *
 * <p>Copy goes through the CDK, which falls back to a hidden textarea where the async
 * clipboard is unavailable. Deployments served over plain HTTP are common enough in this
 * sector that the modern API alone would leave the button dead for some of them.
 */
@Component({
  selector: 'mifosx-message-actions',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageActionsComponent implements OnDestroy {
  @Input({ required: true }) message!: ChatMessage;

  /** Ask the same question again. Carries the message whose question is to be repeated. */
  @Output() repeatRequested = new EventEmitter<string>();
  /** A rating for this reply, or null when the officer takes one back. */
  @Output() voted = new EventEmitter<'up' | 'down' | null>();
  /** File this exchange as a PDF. Carries the message the exchange ends with. */
  @Output() exportRequested = new EventEmitter<string>();
  /** Pass this exchange on. Carries the message the exchange ends with. */
  @Output() shareRequested = new EventEmitter<string>();

  /** Set for a moment after a copy, so the button confirms it did something. */
  copied = false;

  private readonly clipboard = inject(Clipboard);
  private copiedTimer: ReturnType<typeof setTimeout> | null = null;

  copy(): void {
    if (!this.clipboard.copy(toPlainText(this.message.content))) {
      return; // Nothing was copied, so claiming otherwise would be a lie.
    }
    this.copied = true;
    this.clearTimer();
    this.copiedTimer = setTimeout(() => {
      this.copied = false;
      this.copiedTimer = null;
    }, 2000);
  }

  repeat(): void {
    this.repeatRequested.emit(this.message.id);
  }

  exportPdf(): void {
    this.exportRequested.emit(this.message.id);
  }

  share(): void {
    this.shareRequested.emit(this.message.id);
  }

  /** Clicking the rating already given takes it back, which is how a toggle should behave. */
  vote(choice: 'up' | 'down'): void {
    this.voted.emit(this.message.vote === choice ? null : choice);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);
      this.copiedTimer = null;
    }
  }
}
