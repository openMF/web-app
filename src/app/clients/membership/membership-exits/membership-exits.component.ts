/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ExitFilter, MembershipExit } from '../membership.models';
import { MembershipService } from '../membership.service';

/**
 * Members' requests to leave by status (fineract-dbug #125), next to the membership applications. Overdue refunds come
 * first, then the ones due soonest; a row opens the member's Membership tab.
 */
@Component({
  selector: 'mifosx-membership-exits',
  templateUrl: './membership-exits.component.html',
  styleUrls: ['./membership-exits.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipExitsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private membershipService = inject(MembershipService);
  private destroyRef = inject(DestroyRef);

  readonly filters: ExitFilter[] = [
    'open',
    'requested',
    'settled',
    'refunded',
    'cancelled'
  ];
  readonly status = signal<ExitFilter>('open');
  readonly exits = signal<MembershipExit[]>([]);
  readonly state = signal<'loading' | 'failed' | 'loaded'>('loading');

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const wanted = (params.get('status') ?? 'open') as ExitFilter;
      this.status.set(this.filters.includes(wanted) ? wanted : 'open');
      this.load();
    });
  }

  show(status: ExitFilter): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { status }, replaceUrl: true });
  }

  open(exit: MembershipExit): void {
    this.router.navigate([
      '/members',
      exit.clientId,
      'membership'
    ]);
  }

  load(): void {
    this.state.set('loading');
    this.membershipService.exits({ status: this.status() }).subscribe({
      next: (list) => {
        this.exits.set(
          [...list].sort(
            (a, b) =>
              Number(!!b.overdue) - Number(!!a.overdue) ||
              (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER)
          )
        );
        this.state.set('loaded');
      },
      error: () => this.state.set('failed')
    });
  }
}
