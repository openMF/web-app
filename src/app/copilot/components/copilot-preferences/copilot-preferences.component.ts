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

/**
 * The Preferences tab: the choices an officer can make about the panel, and a plain account
 * of what it does with their clients' details.
 *
 * <p>It rendered a heading and nothing else, so a quarter of the navigation went nowhere.
 * Everything offered here changes something real. Nothing is a stub.
 */
@Component({
  selector: 'mifosx-copilot-preferences',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './copilot-preferences.component.html',
  styleUrls: ['./copilot-preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopilotPreferencesComponent {
  /** Whether the panel opens filling the window. */
  @Input() isFullScreen = false;
  /** Whether conversations are kept on this device between sessions. */
  @Input() historyEnabled = true;
  /** How many conversations are currently saved, so the erase button says what it will do. */
  @Input() savedConversations = 0;

  @Output() fullScreenToggled = new EventEmitter<void>();
  @Output() historyToggled = new EventEmitter<boolean>();
  @Output() historyCleared = new EventEmitter<void>();

  /** Set once the officer has asked to erase, so the button asks again before doing it. */
  confirmingClear = false;

  /**
   * Erasing saved conversations cannot be undone, so the first press only arms the button.
   *
   * <p>Deliberately not a modal dialog: this panel already opens over the application, and a
   * second layer over that is what a confirmation is trying to avoid.
   */
  requestClear(): void {
    if (!this.confirmingClear) {
      this.confirmingClear = true;
      return;
    }
    this.confirmingClear = false;
    this.historyCleared.emit();
  }

  cancelClear(): void {
    this.confirmingClear = false;
  }
}
