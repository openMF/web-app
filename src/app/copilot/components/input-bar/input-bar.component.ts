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

/** Glass input bar: attach (disabled), text input, mic (disabled), send / stop. */
@Component({
  selector: 'mifosx-input-bar',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss']
})
export class InputBarComponent {
  @Input() isStreaming = false;
  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();

  userInput = '';

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const text = this.userInput.trim();
    if (!text || this.isStreaming) {
      return;
    }
    this.send.emit(text);
    this.userInput = '';
  }
}
