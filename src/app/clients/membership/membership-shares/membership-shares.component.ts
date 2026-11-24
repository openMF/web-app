/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { MemberShares, MembershipExit } from '../membership.models';
import { MembershipService } from '../membership.service';
import { MembershipExitDialogComponent } from '../membership-exit-dialog/membership-exit-dialog.component';

/** Price of one share (kitta), fixed by the backend (fineract-dbug #125) */
const KITTA_PRICE = 100;

/**
 * A member's share position, what stands in the way of leaving, and the request to leave with its steps
 * (fineract-dbug #125, docs/share-rules-and-leaving.md). Shown on the member's Membership tab.
 */
@Component({
  selector: 'mifosx-membership-shares',
  templateUrl: './membership-shares.component.html',
  styleUrls: ['./membership-shares.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipSharesComponent implements OnChanges {
  private membershipService = inject(MembershipService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  @Input({ required: true }) clientId!: number;
  /** Only an active member can ask to leave */
  @Input() active = false;

  readonly state = signal<'loading' | 'failed' | 'notFound' | 'loaded'>('loading');
  readonly shares = signal<MemberShares | null>(null);
  /** Every request of the member, newest first */
  readonly history = signal<MembershipExit[]>([]);
  readonly busy = signal(false);

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    forkJoin([
      this.membershipService.shares(this.clientId),
      this.membershipService.exits({ clientId: this.clientId }).pipe(catchError(() => of([] as MembershipExit[])))
    ]).subscribe({
      next: ([
        shares,
        history
      ]) => {
        this.shares.set(shares);
        this.history.set(history);
        this.state.set('loaded');
      },
      error: (e: HttpErrorResponse) => this.state.set(e.status === 404 ? 'notFound' : 'failed')
    });
  }

  /** How many more kitta the member can buy, from the room in rupees */
  canStillBuy(s: MemberShares): number {
    return Math.floor((s.roomAmount ?? 0) / KITTA_PRICE);
  }

  /** Requests no longer open */
  closed(): MembershipExit[] {
    return this.history().filter((e) => e.status === 'REFUNDED' || e.status === 'CANCELLED');
  }

  ask(): void {
    this.dialog
      .open(MembershipExitDialogComponent, { data: { mode: 'request', clientId: this.clientId } })
      .afterClosed()
      .subscribe((done) => done && this.load());
  }

  /** Re-reads afterwards whatever the answer: another clerk may have added a loan in between. */
  settle(exit: MembershipExit): void {
    this.busy.set(true);
    this.membershipService.exitCommand(exit.id, 'settle').subscribe({
      next: () => this.afterStep(),
      error: () => this.afterStep()
    });
  }

  refund(exit: MembershipExit): void {
    this.dialog
      .open(MembershipExitDialogComponent, {
        data: { mode: 'refund', clientId: this.clientId, exit, minDate: exit.settledOn ?? exit.requestedOn }
      })
      .afterClosed()
      .subscribe((done) => done && this.load());
  }

  cancel(exit: MembershipExit): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          heading: this.translate.instant('exit.cancel'),
          dialogContext: this.translate.instant('exit.cancelConfirm'),
          type: 'Mild'
        }
      })
      .afterClosed()
      .subscribe((response: any) => {
        if (response?.confirm) {
          this.busy.set(true);
          this.membershipService.exitCommand(exit.id, 'cancel').subscribe({
            next: () => this.afterStep(),
            error: () => this.afterStep()
          });
        }
      });
  }

  private afterStep(): void {
    this.busy.set(false);
    this.load();
  }
}
