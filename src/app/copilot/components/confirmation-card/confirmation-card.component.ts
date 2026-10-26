/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActionCard } from '../../core/models/action-card.model';
import { translateCardLabel } from '../../core/card-label';

/** Mandatory confirmation shown before any write action ("involves real money"). */
@Component({
  selector: 'mifosx-confirmation-card',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './confirmation-card.component.html',
  styleUrls: ['./confirmation-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationCardComponent {
  private readonly translate = inject(TranslateService);

  @Input() card!: ActionCard;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  /**
   * Ordered label/value pairs, with the label put into the officer's language.
   *
   * Row labels are written by the gateway from its tool manifest, which is English. The
   * shared vocabulary is translated here; anything a deployment added itself falls through
   * to the gateway's own wording.
   */
  objectEntries(data: Record<string, string>): [
    string,
    string
  ][] {
    return Object.entries(data ?? {}).map(
      ([
        label,
        value
      ]) => [
        translateCardLabel(label, (key) => this.translate.instant(key)),
        value
      ]
    );
  }
}
