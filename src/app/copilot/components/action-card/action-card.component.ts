/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCard, ActionCardType } from '../../core/models/action-card.model';

/** Renders a single structured ActionCard (client / loan / savings / insight / confirmation). */
@Component({
  selector: 'mifosx-action-card',
  imports: [CommonModule],
  templateUrl: './action-card.component.html',
  styleUrls: ['./action-card.component.scss']
})
export class ActionCardComponent {
  @Input() card!: ActionCard;
  @Output() action = new EventEmitter<string | undefined>();
  @Output() route = new EventEmitter<string | undefined>();

  /** SVG path for each card type's header icon. */
  cardTypeIcon(type: ActionCardType): string {
    switch (type) {
      case 'loan':
        return 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z';
      case 'savings':
        return 'M19 5c-1.5 0-2.7 1.2-2.7 2.7 0 .27.04.53.12.78L12.5 11 9.4 8.9c.06-.21.1-.43.1-.65C9.5 6.75 8.25 5.5 6.7 5.5S3.9 6.75 3.9 8.3c0 1.43 1.06 2.61 2.44 2.78v6.92h12V8c0-1.66-1.34-3-3-3zm-12.3 3.3c0-.39.31-.7.7-.7s.7.31.7.7-.31.7-.7.7-.7-.31-.7-.7z';
      case 'insight':
        return 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z';
      case 'confirmation':
        return 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
      case 'client':
      default:
        return 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
    }
  }

  /** Ordered label/value pairs for the card body. */
  objectEntries(data: Record<string, string>): [
    string,
    string
  ][] {
    return Object.entries(data ?? {});
  }
}
