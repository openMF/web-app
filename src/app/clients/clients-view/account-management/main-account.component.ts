/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, finalize, switchMap, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { AccountRelationshipsService } from './account-relationships.service';
import { AccountManagementAccess } from './account-management-access.service';
import { ClientSection, errorKey, positiveId, resource } from './account-management.state';
import { MainCapabilities, MainRelationships, MainAudit, NativeSavings } from './account-management.model';
import { AccountMoneyPipe } from './account-money.pipe';
import { AccountStatusComponent } from './account-status.component';
import { ResourceStateComponent } from './resource-state.component';

@Component({
  selector: 'mifosx-main-account',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    AccountMoneyPipe,
    AccountStatusComponent,
    ResourceStateComponent
  ],
  templateUrl: './main-account.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainAccountComponent extends ClientSection {
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(AccountRelationshipsService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly mainChanged$ = new Subject<void>();
  readonly capabilities = resource<MainCapabilities>();
  readonly main = resource<MainRelationships>();
  readonly native = resource<NativeSavings>();
  readonly audit = resource<MainAudit[]>();
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  readonly columns = [
    'action',
    'account',
    'policy',
    'actor',
    'date'
  ];
  constructor() {
    const fb = inject(FormBuilder);
    super();
    this.form = fb.nonNullable.group({ savingsAccountId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[1-9][0-9]*$/)
        ]
      ] });
  }
  readonly form;
  protected reset(): void {
    this.capabilities.set({ data: null, loading: false, error: null });
    this.message.set(null);
    this.busy.set(false);
    this.form.reset();
    this.main.set({ data: null, loading: false, error: null });
    this.native.set({ data: null, loading: false, error: null });
    this.audit.set({ data: null, loading: false, error: null });
    if (!positiveId(this.clientId) || !this.access.has('READ_SAVINGS_ACCOUNT_RELATIONSHIP')) return;
    this.capabilities.set({ data: null, loading: true, error: null });
    this.scoped(this.api.template()).subscribe({
      next: (data) => {
        this.capabilities.set({ data, loading: false, error: null });
        this.loadMain();
        this.loadAudit();
      },
      error: (error) => this.capabilities.set({ data: null, loading: false, error: errorKey(error, true) })
    });
  }
  reload(): void {
    this.ngOnChanges();
  }
  loadMain(): void {
    this.mainChanged$.next();
    this.native.set({ data: null, loading: false, error: null });
    this.main.set({ data: null, loading: true, error: null });
    this.scoped(this.api.main(this.clientId).pipe(takeUntil(this.mainChanged$))).subscribe({
      next: (data) => {
        this.main.set({ data, loading: false, error: null });
        const row = data.relationships[0];
        if (row && this.access.has('READ_SAVINGSACCOUNT'))
          this.read(
            this.native,
            this.api.native(this.clientId, row.savingsAccountId).pipe(takeUntil(this.mainChanged$))
          );
      },
      error: (error) => this.main.set({ data: null, loading: false, error: errorKey(error) })
    });
  }
  loadAudit(): void {
    this.page(this.audit, this.api.audit(this.clientId, this.audit().data?.at(-1)?.id || 0));
  }
  get canBind(): boolean {
    return (
      this.capabilities().data?.mainAccountRelationships === true &&
      this.access.has('BIND_MAIN_SAVINGS_ACCOUNT') &&
      this.access.has('READ_SAVINGSACCOUNT')
    );
  }
  bind(): void {
    const id = Number(this.form.controls.savingsAccountId.value);
    if (!this.canBind || this.busy() || this.form.invalid || !positiveId(id)) return;
    this.busy.set(true);
    this.message.set(null);
    this.scoped(
      this.api.native(this.clientId, id).pipe(
        switchMap((account) => {
          const ref = this.trackDialog(
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                heading: this.translate.instant('AccountManagement.BindMain'),
                type: 'Strong',
                dialogContext: this.translate.instant('AccountManagement.ConfirmBind', {
                  account: account.accountNo,
                  client: this.clientId
                })
              }
            })
          );
          // A route/customer change dismisses a dialog for the old scope before any write can start.

          return ref
            .afterClosed()
            .pipe(switchMap((answer) => (answer?.confirm && this.canBind ? this.api.bind(this.clientId, id) : EMPTY)));
        }),
        finalize(() => this.busy.set(false))
      )
    ).subscribe({
      next: () => {
        this.message.set('AccountManagement.MetadataSaved');
        this.form.reset();
        this.audit.set({ data: null, loading: false, error: null });
        this.loadMain();
        this.loadAudit();
      },
      error: (error) => {
        this.message.set(errorKey(error));
        if (error?.status === 409) {
          this.loadMain();
          this.audit.set({ data: null, loading: false, error: null });
          this.loadAudit();
        }
      }
    });
  }
}
