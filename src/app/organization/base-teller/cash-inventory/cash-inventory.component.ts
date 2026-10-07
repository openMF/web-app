/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, catchError, finalize, switchMap } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import {
  CashInventoryContext,
  CashInventoryFilters,
  CashInventoryRow,
  CashInventoryService,
  CashInventoryTransactionType
} from './cash-inventory.service';

@Component({
  selector: 'mifosx-cash-inventory',
  templateUrl: './cash-inventory.component.html',
  styleUrls: ['./cash-inventory.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashInventoryComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly cashInventoryService = inject(CashInventoryService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inventoryRequests = new Subject<CashInventoryFilters>();

  readonly filterForm = this.formBuilder.group({
    custodianKey: new FormControl<string | null>(null),
    transactionType: new FormControl<CashInventoryTransactionType | null>(null),
    currencyCode: new FormControl<string | null>(null),
    showLastCutOff: new FormControl(false, { nonNullable: true })
  });
  readonly displayedColumns = [
    'userCode',
    'name',
    'inventoryType',
    'currencyCode',
    'initialBalance',
    'accumulatedInflows',
    'accumulatedOutflows',
    'cutOffs',
    'balance'
  ];

  context?: CashInventoryContext;
  rows: CashInventoryRow[] = [];
  contextLoading = false;
  inventoryLoading = false;
  contextError = '';
  inventoryError = '';
  hasLoadedInventory = false;

  get asOf(): string | undefined {
    return this.rows.find((row) => row.asOf)?.asOf;
  }

  ngOnInit(): void {
    if (!this.hasReadPermission()) {
      this.contextError = 'cashInventory.errors.forbidden';
      return;
    }
    this.configureInventoryRequests();
    this.loadContext();
  }

  loadContext(): void {
    this.contextLoading = true;
    this.contextError = '';
    this.filterForm.disable({ emitEvent: false });
    this.cashInventoryService
      .getContext()
      .pipe(
        finalize(() => {
          this.contextLoading = false;
          this.filterForm.enable({ emitEvent: false });
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (context) => {
          this.context = context;
          this.applyFilters();
        },
        error: (error: unknown) => {
          this.context = undefined;
          this.contextError = this.errorKey(error, 'cashInventory.errors.context');
        }
      });
  }

  applyFilters(): void {
    if (!this.context) {
      return;
    }
    const filters = this.filterForm.getRawValue();
    this.inventoryRequests.next(filters);
  }

  retryInventory(): void {
    this.applyFilters();
  }

  digitsInfo(row: CashInventoryRow): string {
    return `1.${row.decimalPlaces}-${row.decimalPlaces}`;
  }

  private configureInventoryRequests(): void {
    this.inventoryRequests
      .pipe(
        switchMap((filters) => {
          this.inventoryLoading = true;
          this.inventoryError = '';
          this.hasLoadedInventory = false;
          this.cdr.markForCheck();
          return this.cashInventoryService.getInventory(filters).pipe(
            catchError((error: unknown) => {
              this.rows = [];
              this.inventoryError = this.errorKey(error, 'cashInventory.errors.inventory');
              return EMPTY;
            }),
            finalize(() => {
              this.inventoryLoading = false;
              this.hasLoadedInventory = true;
              this.cdr.markForCheck();
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => {
        this.rows = rows;
      });
  }

  private hasReadPermission(): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes('ALL_FUNCTIONS_READ') ||
      permissions.includes('READ_BASE_TELLER_CASH_INVENTORY')
    );
  }

  private errorKey(error: unknown, fallback: string): string {
    return error instanceof HttpErrorResponse && error.status === 403 ? 'cashInventory.errors.forbidden' : fallback;
  }
}
