/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  styleUrls: ['./input-bar.component.scss']
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

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
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
