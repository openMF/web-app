/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * A deadline as a word, not only a colour: overdue in red, due within three days in amber, otherwise grey
 * (the same three days the backend counts as "due soon").
 */
@Component({
  selector: 'mifosx-due-chip',
  template: `<span class="chip" [class]="tone()">{{ label() | translate: { days: days() } }}</span>`,
  styles: [
    `
      .chip {
        display: inline-block;
        padding: 0 8px;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 20px;
        white-space: nowrap;
      }
      .red {
        color: var(--dk-danger, #9f1f17);
        background: var(--dk-danger-soft, #fdeceb);
      }
      .amber {
        color: var(--dk-warning, #7a4a00);
        background: var(--dk-warning-soft, #fff0d1);
      }
      .grey {
        color: var(--dk-text-2, #3f4448);
        background: var(--dk-surface-3, #eceff1);
      }
    `
  ],
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DueChipComponent {
  /** Days until the deadline; negative when late. */
  readonly daysLeft = input<number | null | undefined>(null);

  readonly days = computed(() => Math.abs(this.daysLeft() ?? 0));
  readonly tone = computed(() => {
    const d = this.daysLeft();
    if (d === null || d === undefined) {
      return 'chip grey';
    }
    return d < 0 ? 'chip red' : d <= 3 ? 'chip amber' : 'chip grey';
  });
  readonly label = computed(() => {
    const d = this.daysLeft();
    if (d === null || d === undefined) {
      return 'compliance.No deadline';
    }
    if (d < 0) {
      return 'compliance.Days late';
    }
    if (d === 0) {
      return 'compliance.Due today';
    }
    return 'compliance.Due in days';
  });
}
