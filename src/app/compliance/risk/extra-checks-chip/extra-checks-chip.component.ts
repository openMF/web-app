/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnChanges, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { RiskService } from '../risk.service';

/**
 * "Extra checks" in the member header (fineract-dbug #136, design M5): the member is high risk or under enhanced
 * checks. Staff serving the member see only this, never why; it never depends on alerts or cases, so it cannot tell
 * anyone a report was made (policy §35).
 */
@Component({
  selector: 'mifosx-extra-checks-chip',
  template: `
    @if (show()) {
      <span class="extra-checks" [title]="'compliance.extraChecksTitle' | translate">{{
        'compliance.Extra checks' | translate
      }}</span>
    }
  `,
  styles: [
    `
      .extra-checks {
        display: inline-block;
        margin-left: 8px;
        padding: 0 10px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        line-height: 24px;
        white-space: nowrap;
        vertical-align: middle;
        color: var(--dk-warning, #7a4a00);
        background: var(--dk-warning-soft, #fff0d1);
      }
      @media (width <= 600px) {
        .extra-checks {
          margin-left: 0;
        }
      }
    `
  ],
  imports: [...STANDALONE_SHARED_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtraChecksChipComponent implements OnChanges {
  private risk = inject(RiskService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) clientId!: number;
  readonly show = signal(false);

  ngOnChanges(): void {
    this.show.set(false);
    const id = Number(this.clientId);
    if (!id) {
      return;
    }
    this.risk
      .extraChecks(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (f) => this.show.set(!!f.extraChecks), error: () => this.show.set(false) });
  }
}
