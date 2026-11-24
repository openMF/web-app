/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, map, merge, of, switchMap, tap } from 'rxjs';
import { ClientsService } from 'app/clients/clients.service';
import { SearchService } from 'app/search/search.service';
import { StatusLookupPipe } from 'app/pipes/status-lookup.pipe';
import { AccountNumberComponent } from 'app/shared/account-number/account-number.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** A member's active savings account, as a row of the results table. */
interface AccountRow {
  clientId: number;
  memberName: string;
  memberNo?: string;
  account: any;
}

/**
 * Sidebar shortcut to savings deposits and withdrawals: search by member name, member number or savings
 * account number, then open the account's usual Deposit / Withdrawal form from the results table.
 */
@Component({
  selector: 'mifosx-quick-transaction',
  templateUrl: './quick-transaction.component.html',
  styleUrls: ['./quick-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPrefix,
    MatIcon,
    MatProgressBar,
    MatTableModule,
    StatusLookupPipe,
    AccountNumberComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickTransactionComponent {
  private clientsService = inject(ClientsService);
  private searchService = inject(SearchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** 'Deposit' or 'Withdrawal': the action this sidebar link was opened for. */
  readonly command: 'Deposit' | 'Withdrawal' = inject(ActivatedRoute).snapshot.data['command'];
  /** Member name or number; searching by one field clears the other. */
  readonly name = new FormControl('', { nonNullable: true });
  /** Savings account number. */
  readonly accountNo = new FormControl('', { nonNullable: true });
  readonly columns = [
    'member',
    'accountNo',
    'product',
    'balance',
    'actions'
  ];
  /** Null before the first search. */
  rows: AccountRow[] | null = null;
  loading = false;

  constructor() {
    merge(
      this.name.valueChanges.pipe(
        tap(() => this.accountNo.setValue('', { emitEvent: false })),
        map((text) => ({ byAccount: false, text: text.trim() }))
      ),
      this.accountNo.valueChanges.pipe(
        tap(() => this.name.setValue('', { emitEvent: false })),
        map((text) => ({ byAccount: true, text: text.trim() }))
      )
    )
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.byAccount === b.byAccount && a.text === b.text),
        tap(({ text }) => {
          this.loading = text.length >= 2;
          this.cdr.markForCheck();
        }),
        switchMap(({ byAccount, text }) => (text.length < 2 ? of(null) : this.find(text, byAccount))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => {
        this.rows = rows;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  /** Active members matching the text with all their accounts, or the savings accounts whose number matches. */
  private find(text: string, byAccount: boolean) {
    return forkJoin([
      byAccount ? of(null) : this.clientsService.searchByText(text, 0, 10).pipe(catchError(() => of(null))),
      byAccount ? this.searchService.getSearchResults(text, 'savings').pipe(catchError(() => of([]))) : of([])
    ]).pipe(
      switchMap(
        ([
          members,
          hits
        ]: any[]) => {
          // clientId -> the member's name and number, and which accounts to show (null: all of them)
          const clients = new Map<number, { name: string; no?: string; only: Set<number> | null }>();
          for (const m of members?.content ?? []) {
            if (m.status?.code === 'clientStatusType.active') {
              clients.set(m.id, { name: m.displayName, no: m.accountNumber, only: null });
            }
          }
          for (const h of hits ?? []) {
            if (h.parentType !== 'client' || h.subEntityType !== 'depositAccountType.savingsDeposit') {
              continue;
            }
            const c = clients.get(h.parentId) ?? { name: h.parentName, only: new Set<number>() };
            c.only?.add(h.entityId);
            clients.set(h.parentId, c);
          }
          // ponytail: one accounts call per member, capped at 10; a bulk endpoint if searches get wide
          const ids = [...clients.keys()].slice(0, 10);
          if (!ids.length) {
            return of([]);
          }
          return forkJoin(
            ids.map((id) =>
              this.clientsService.getClientAccountData(String(id)).pipe(catchError(() => of({ savingsAccounts: [] })))
            )
          ).pipe(
            map((data: any[]) =>
              data.flatMap((d, i) => {
                const c = clients.get(ids[i]);
                return (d.savingsAccounts ?? [])
                  .filter(
                    (a: any) =>
                      a.status?.active &&
                      a.depositType?.code === 'depositAccountType.savingsDeposit' &&
                      (!c.only || c.only.has(a.id))
                  )
                  .map((account: any) => ({ clientId: ids[i], memberName: c.name, memberNo: c.no, account }));
              })
            )
          );
        }
      )
    );
  }

  open(row: AccountRow): void {
    this.router.navigate([
      '/members',
      row.clientId,
      'savings-accounts',
      row.account.id,
      'actions',
      this.command
    ]);
  }
}
