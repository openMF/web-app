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

/** Topbar: logo + brand, current-session label, New Chat and Close buttons. */
@Component({
  selector: 'mifosx-copilot-header',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './copilot-header.component.html',
  styleUrls: ['./copilot-header.component.scss']
})
export class CopilotHeaderComponent {
  @Input() contextLabel: string | null = null;
  @Output() newChat = new EventEmitter<void>();
  @Output() closePanel = new EventEmitter<void>();
}
