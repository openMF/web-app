/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MembershipApplication, deadlineTone } from '../membership.models';

/**
 * How long the board has left to decide a pending application: green with time to spare, amber in the last week,
 * red once overdue. Nothing for a decided application.
 */
@Component({
  selector: 'mifosx-membership-deadline',
  template: `
    @if (tone) {
      <span class="deadline" [class]="tone">
        <fa-icon icon="clock" size="sm"></fa-icon>
        @if (tone === 'overdue') {
          {{ 'membership.daysOverdue' | translate: { days: -application.daysRemaining } }}
        } @else {
          {{ 'membership.daysLeft' | translate: { left: application.daysRemaining, total: total } }}
        }
      </span>
    }
  `,
  styles: [
    `
      .deadline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .ok {
        background: var(--dk-success-soft, #e7f5e8);
        color: var(--dk-success, #2e7d32);
      }
      .soon {
        background: var(--dk-warning-soft, #fff1dc);
        color: var(--dk-warning, #a15c00);
      }
      .overdue {
        background: var(--dk-danger-soft, #fde8e7);
        color: var(--dk-danger, #c62828);
      }
    `
  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipDeadlineComponent {
  @Input({ required: true }) application!: MembershipApplication;

  get tone() {
    return this.application ? deadlineTone(this.application) : null;
  }

  /** The board's period: days gone plus days left. */
  get total(): number {
    return (this.application.daysElapsed ?? 0) + (this.application.daysRemaining ?? 0);
  }
}
