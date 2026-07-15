/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Context-aware suggested-prompt chips. Renders the chip buttons directly into
 * the host element so the host (given a `.chips` / `.welcome__prompts` class by
 * the parent) acts as the flex container defined in the panel stylesheet.
 */
@Component({
  selector: 'mifosx-quick-chips',
  imports: [
    CommonModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './quick-chips.component.html',
  styleUrls: ['./quick-chips.component.scss']
})
export class QuickChipsComponent {
  @Input() prompts: string[] = [];
  /** Larger "outline" variant used on the welcome state. */
  @Input() outline = false;
  @Output() selected = new EventEmitter<string>();

  trackByPrompt(_index: number, prompt: string): string {
    return prompt;
  }
}
