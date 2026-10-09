/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/** Glass input bar: attach (disabled), text input, mic (disabled), send / stop. */
@Component({
  selector: 'mifosx-input-bar',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputBarComponent {
  @Input() isStreaming = false;
  /**
   * What is in the composer, owned by the panel.
   *
   * <p>The bar used to hold this itself and empty it on every send, including the sends that
   * were refused for being too long or looking like an injection attempt. The officer was then
   * shown a complaint about text they could no longer see. The panel clears this when a
   * question is actually on its way, and leaves it alone when it is not.
   */
  @Input() text = '';
  @Output() textChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();
  /** Up arrow in an empty composer: put the last question back to be reworded. */
  @Output() editLast = new EventEmitter<void>();

  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLInputElement>;

  /** Put the caret in the composer, for the panel's keyboard shortcuts. */
  focusInput(): void {
    this.messageInput?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
      return;
    }
    // Only from an empty composer, so it can never eat a caret movement in text the officer
    // is still writing. This is the shell convention, and the one people try first.
    if (event.key === 'ArrowUp' && !this.text && !this.isStreaming) {
      event.preventDefault();
      this.editLast.emit();
      return;
    }
    // Escape stops a reply that is going the wrong way, without reaching for the button.
    if (event.key === 'Escape' && this.isStreaming) {
      event.preventDefault();
      this.stop.emit();
    }
  }

  submit(): void {
    const trimmed = this.text.trim();
    if (!trimmed || this.isStreaming) {
      return;
    }
    this.send.emit(trimmed);
  }
}
