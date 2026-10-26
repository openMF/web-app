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
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ChatMessage } from '../../core/models/chat-message.model';
import { toPlainText } from '../../core/plain-text';
import { CopilotExportFormat, CopilotExportService } from '../../services/copilot-export.service';

/** What each format is called and drawn as, so the template holds no format-specific markup. */
const FORMAT_LABELS: Record<CopilotExportFormat, string> = {
  pdf: 'copilot.actions.export.pdf',
  csv: 'copilot.actions.export.csv',
  png: 'copilot.actions.export.png'
};

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
    MatMenuModule,
    TranslateModule
  ],
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageActionsComponent implements OnDestroy {
  /**
   * The reply these actions belong to.
   *
   * <p>Set through a setter so the formats are worked out once, when the reply arrives, rather
   * than on every change detection. Working them out means parsing the answer for tables, and
   * this component is rendered once per reply in the conversation.
   */
  @Input({ required: true })
  set message(value: ChatMessage) {
    this.reply = value;
    this.exportFormats = this.exportService.formatsFor(value);
  }
  get message(): ChatMessage {
    return this.reply;
  }
  private reply!: ChatMessage;

  /**
   * The exports this particular reply supports, in the order they are offered.
   *
   * <p>Context-aware on purpose: a spreadsheet is only offered for an answer that has rows and
   * columns in it. A CSV of a sentence is a file with a sentence in cell A1.
   */
  exportFormats: CopilotExportFormat[] = [];

  /** Ask the same question again. Carries the message whose question is to be repeated. */
  @Output() repeatRequested = new EventEmitter<string>();
  /** A rating for this reply, or null when the officer takes one back. */
  @Output() voted = new EventEmitter<'up' | 'down' | null>();
  /** Take this exchange out of the panel, in the format the officer picked. */
  @Output() exportRequested = new EventEmitter<{ messageId: string; format: CopilotExportFormat }>();
  /** Pass this exchange on. Carries the message the exchange ends with. */
  @Output() shareRequested = new EventEmitter<string>();

  /** Set for a moment after a copy, so the button confirms it did something. */
  copied = false;

  private readonly clipboard = inject(Clipboard);
  private readonly exportService = inject(CopilotExportService);
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

  exportAs(format: CopilotExportFormat): void {
    this.exportRequested.emit({ messageId: this.message.id, format });
  }

  /** The translation key naming a format in the menu. */
  labelFor(format: CopilotExportFormat): string {
    return FORMAT_LABELS[format];
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
