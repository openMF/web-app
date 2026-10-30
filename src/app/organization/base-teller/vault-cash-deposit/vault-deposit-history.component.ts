/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, catchError, defer, finalize, startWith, switchMap, tap } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { WithdrawalMoneyPipe } from '../withdrawals/withdrawal-money.pipe';
import { canReadVaultHistory } from './vault-cash-deposit.guard';
import {
  VaultDepositHistoryFilter,
  VaultDepositHistoryItem,
  VaultDepositHistoryResponse,
  vaultAttemptStatusLabel
} from './vault-deposit-history.models';
import { VaultDepositHistoryService, vaultHistoryErrorKey } from './vault-deposit-history.service';
import { VaultDepositDetailDialogComponent } from './vault-deposit-detail-dialog.component';

const isoDate = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string;
  if (!value) return null;
  const parsed = new Date(value + 'T00:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? null
    : { date: true };
};

@Component({
  selector: 'mifosx-vault-deposit-history',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    WithdrawalMoneyPipe
  ],
  templateUrl: './vault-deposit-history.component.html',
  styleUrls: ['./vault-deposit-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VaultDepositHistoryComponent implements OnInit {
  private readonly formBuilder: FormBuilder;
  private readonly service = inject(VaultDepositHistoryService);
  private readonly authentication = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<void>();
  readonly loading = signal(false);
  readonly error = signal('');
  readonly page = signal<VaultDepositHistoryResponse | null>(null);
  readonly statusLabel = vaultAttemptStatusLabel;
  readonly columns = [
    'reference',
    'date',
    'branch',
    'vault',
    'amount',
    'status',
    'actions'
  ];
  readonly pageSizes = [
    10,
    25,
    50,
    100
  ];
  pageIndex = 0;
  pageSize = 25;
  private appliedFilters: VaultDepositHistoryFilter = {};
  readonly filtersForm;

  constructor() {
    this.formBuilder = inject(FormBuilder);
    this.filtersForm = this.formBuilder.nonNullable.group(
      {
        fromDate: [
          '',
          isoDate
        ],
        toDate: [
          '',
          isoDate
        ],
        officeId: [
          '',
          Validators.pattern(/^[1-9]\d{0,14}$/)
        ],
        vaultKey: [
          '',
          Validators.pattern(/^VAULT:[1-9]\d{0,14}$/)
        ],
        currencyCode: [
          '',
          Validators.pattern(/^[A-Za-z]{3}$/)
        ],
        status: this.formBuilder.nonNullable.control<'' | 'BLOCKED'>(''),
        reference: [
          '',
          Validators.pattern(/^VDA-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
        ]
      },
      {
        validators: (control) => {
          const { fromDate, toDate, officeId, vaultKey } = control.getRawValue();
          if (fromDate && toDate && fromDate > toDate) return { dateRange: true };
          return officeId && vaultKey && `VAULT:${officeId}` !== vaultKey ? { vaultMismatch: true } : null;
        }
      }
    );
  }

  ngOnInit(): void {
    this.requests
      .pipe(
        startWith(undefined),
        switchMap(() =>
          defer(() => {
            this.error.set('');
            if (!this.authentication.isAuthenticated()) {
              this.page.set(null);
              this.error.set('vaultDeposit.errors.unauthenticated');
              return EMPTY;
            }
            if (!canReadVaultHistory(this.authentication.getCredentials()?.permissions ?? [])) {
              this.page.set(null);
              this.error.set('vaultDeposit.errors.forbidden');
              return EMPTY;
            }
            this.loading.set(true);
            return this.service
              .search({ ...this.appliedFilters, offset: this.pageIndex * this.pageSize, limit: this.pageSize })
              .pipe(
                tap((page) => this.page.set(page)),
                catchError((error: unknown) => {
                  this.page.set(null);
                  this.error.set(vaultHistoryErrorKey(error));
                  return EMPTY;
                }),
                finalize(() => this.loading.set(false))
              );
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  applyFilters(): void {
    this.filtersForm.markAllAsTouched();
    if (this.filtersForm.invalid) return;
    const values = this.filtersForm.getRawValue();
    this.appliedFilters = {
      fromDate: values.fromDate || undefined,
      toDate: values.toDate || undefined,
      officeId: values.officeId ? Number(values.officeId) : undefined,
      vaultKey: values.vaultKey || undefined,
      currencyCode: values.currencyCode.toUpperCase() || undefined,
      status: values.status || undefined,
      reference: values.reference || undefined
    };
    this.pageIndex = 0;
    this.refresh();
  }

  resetFilters(): void {
    this.filtersForm.reset();
    this.appliedFilters = {};
    this.pageIndex = 0;
    this.refresh();
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.refresh();
  }

  refresh(): void {
    this.requests.next();
  }

  openDetail(item: VaultDepositHistoryItem): void {
    if (
      !item.permittedActions.includes('VIEW_DETAILS') ||
      !canReadVaultHistory(this.authentication.getCredentials()?.permissions ?? [])
    )
      return;
    this.dialog.open(VaultDepositDetailDialogComponent, {
      data: { reference: item.attemptReference },
      width: '880px',
      maxWidth: '96vw',
      ariaLabelledBy: 'vault-detail-title',
      restoreFocus: true
    });
  }
}
