/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCard } from '../../core/models/action-card.model';

/** Mandatory confirmation shown before any write action ("involves real money"). */
@Component({
  selector: 'mifosx-confirmation-card',
  imports: [CommonModule],
  templateUrl: './confirmation-card.component.html',
  styleUrls: ['./confirmation-card.component.scss']
})
export class ConfirmationCardComponent {
  @Input() card!: ActionCard;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
