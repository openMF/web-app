/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { ClientSection, errorKey, positiveId, resource } from './account-management.state';
import { PlannedAccountsService } from './planned-accounts.service';
import { AccountRelationshipsService } from './account-relationships.service';
import { AccountManagementAccess } from './account-management-access.service';
import {
  Arrangement,
  Contribution,
  Eligibility,
  NativeSnapshot,
  PlannedCapabilities
} from './account-management.model';
import { ResourceStateComponent } from './resource-state.component';
import { AccountStatusComponent } from './account-status.component';
import { AccountMoneyPipe } from './account-money.pipe';
import { NativeAccountComponent } from './native-account.component';
import { PlannedAuditComponent } from './planned-audit.component';

@Component({
  selector: 'mifosx-planned-account-details',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    ResourceStateComponent,
    AccountStatusComponent,
    AccountMoneyPipe,
    NativeAccountComponent,
    PlannedAuditComponent
  ],
  templateUrl: './planned-account-details.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedAccountDetailsComponent extends ClientSection {
  @Input({ required: true }) arrangement: Arrangement;
  @Input({ required: true }) capabilities: PlannedCapabilities;
  @Output() updated = new EventEmitter<void>();
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(PlannedAccountsService);
  private readonly accounts = inject(AccountRelationshipsService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  readonly contributions = resource<Contribution[]>();
  readonly maturity = resource<Eligibility>();
  readonly native = resource<NativeSnapshot>();
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  readonly columns = [
    'date',
    'expected',
    'state',
    'transaction'
  ];
  readonly form;
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
  protected reset(): void {
    for (const state of [
      this.contributions,
      this.maturity,
      this.native
    ]) state.set({ data: null, loading: false, error: null });
    this.busy.set(false);
    this.message.set(null);
    this.form.reset();
    if (this.arrangement?.clientId !== this.clientId || !this.access.has('READ_PLANNED_SAVINGS')) return;
    if (this.capabilities.scheduleProjection === true) this.loadContributions();
    this.loadMaturity();
    this.loadNative();
  }
  loadContributions(): void {
    this.page(
      this.contributions,
      this.api.contributions(this.clientId, this.arrangement, this.contributions().data?.at(-1)?.sequence || 0)
    );
  }
  loadMaturity(): void {
    this.read(this.maturity, this.api.maturity(this.clientId, this.arrangement.id));
  }
  loadNative(): void {
    if (this.arrangement.savingsAccountId)
      this.read(this.native, this.api.native(this.clientId, this.arrangement.savingsAccountId));
  }
  get canLink(): boolean {
    return (
      this.capabilities.arrangementConfiguration === true &&
      this.arrangement.savingsAccountId == null &&
      this.arrangement.configuration.status === 'CONFIGURATION_ONLY' &&
      this.access.has('CONFIGURE_PLANNED_SAVINGS') &&
      this.access.has('READ_SAVINGSACCOUNT')
    );
  }
  link(): void {
    const id = Number(this.form.controls.savingsAccountId.value);
    if (!this.canLink || this.form.invalid || this.busy() || !positiveId(id)) return;
    this.busy.set(true);
    this.message.set(null);
    this.scoped(
      this.accounts.native(this.clientId, id).pipe(
        switchMap((account) => {
          if (account.savingsProductId !== this.arrangement.configuration.savingsProductId) {
            this.message.set('AccountManagement.NativeProductMismatch');
            return EMPTY;
          }
          const ref = this.trackDialog(
            this.dialog.open(ConfirmationDialogComponent, {
              data: {
                heading: this.translate.instant('AccountManagement.LinkNative'),
                dialogContext: this.translate.instant('AccountManagement.ConfirmLink', { account: account.accountNo }),
                type: 'Strong'
              }
            })
          );

          return ref
            .afterClosed()
            .pipe(
              switchMap((answer) =>
                answer?.confirm && this.canLink ? this.api.linkNative(this.clientId, this.arrangement, id) : EMPTY
              )
            );
        }),
        finalize(() => this.busy.set(false))
      )
    ).subscribe({ next: () => this.updated.emit(), error: (error) => this.message.set(errorKey(error)) });
  }
}
