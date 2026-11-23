/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { KymService } from '../kym.service';

/**
 * The member's KYM in the page header (fineract-dbug #190): incomplete, complete, verified or review due. It follows
 * changes made on the KYM tab, and opens that tab. Shown only to users who may read the KYM.
 */
@Component({
  selector: 'mifosx-kym-chip',
  template: `
    @if (state(); as s) {
      <a
        class="kym-chip"
        [class.red]="s === 'INCOMPLETE'"
        [class.blue]="s === 'COMPLETE'"
        [class.green]="s === 'VERIFIED'"
        [class.amber]="s === 'REVIEW_DUE'"
        [routerLink]="['/members', clientId, 'kym']"
        [title]="'kym.chip.title' | translate"
        >{{ 'kym.chip.' + s | translate }}</a
      >
    }
  `,
  styles: [
    `
      .kym-chip {
        display: inline-block;
        margin-left: 8px;
        padding: 0 10px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 500;
        line-height: 24px;
        white-space: nowrap;
        text-decoration: none;
        vertical-align: middle;
        cursor: pointer;
      }
      .red {
        color: var(--dk-danger, #9f1f17);
        background: var(--dk-danger-soft, #fdeceb);
      }
      .amber {
        color: var(--dk-warning, #7a4a00);
        background: var(--dk-warning-soft, #fff0d1);
      }
      .green {
        color: var(--dk-success, #1b6b2a);
        background: var(--dk-success-soft, #e3f3e6);
      }
      .blue {
        color: var(--dk-primary, #0b5488);
        background: var(--dk-primary-soft, #e0edf8);
      }
      @media (width <= 600px) {
        .kym-chip {
          margin-left: 0;
        }
      }
    `
  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KymChipComponent implements OnChanges {
  private kymService = inject(KymService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) clientId!: number;

  private readonly forClient = signal<number | null>(null);
  readonly state = computed(() => {
    const k = this.kymService.latest();
    if (!k || k.clientId !== this.forClient()) {
      return null;
    }
    return k.reviewDue ? 'REVIEW_DUE' : k.status;
  });

  ngOnChanges(): void {
    const id = Number(this.clientId);
    this.forClient.set(id);
    if (this.kymService.canRead() && id) {
      this.kymService
        .get(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => undefined });
    }
  }
}
