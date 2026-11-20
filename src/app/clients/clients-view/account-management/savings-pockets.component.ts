/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { PlannedAccountsService } from './planned-accounts.service';
import { AccountManagementAccess } from './account-management-access.service';
import { ClientSection, errorKey, positiveId, resource } from './account-management.state';
import { PlannedCapabilities, Pocket, Eligibility } from './account-management.model';
import { ResourceStateComponent } from './resource-state.component';
import { AccountStatusComponent } from './account-status.component';
import { NativeAccountComponent } from './native-account.component';
import { PlannedAuditComponent } from './planned-audit.component';
import { PocketNameDialogComponent } from './pocket-name-dialog.component';

@Component({
  selector: 'mifosx-savings-pockets',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    ResourceStateComponent,
    AccountStatusComponent,
    NativeAccountComponent,
    PlannedAuditComponent
  ],
  templateUrl: './savings-pockets.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingsPocketsComponent extends ClientSection {
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(PlannedAccountsService);
  private readonly dialog = inject(MatDialog);
  readonly capabilities = resource<PlannedCapabilities>();
  readonly pockets = resource<Pocket[]>();
  readonly closure = new Map<number, ReturnType<typeof resource<Eligibility>>>();
  protected reset(): void {
    this.capabilities.set({ data: null, loading: false, error: null });
    this.pockets.set({ data: null, loading: false, error: null });
    this.closure.clear();
    if (!positiveId(this.clientId) || !this.access.has('READ_PLANNED_SAVINGS')) return;
    this.capabilities.set({ data: null, loading: true, error: null });
    this.scoped(this.api.template()).subscribe({
      next: (data) => {
        this.capabilities.set({ data, loading: false, error: null });
        if (data.pocketRelationships === true) this.load();
      },
      error: (error) => this.capabilities.set({ data: null, loading: false, error: errorKey(error, true) })
    });
  }
  reload(): void {
    this.ngOnChanges();
  }
  load(): void {
    this.page(this.pockets, this.api.pockets(this.clientId, this.pockets().data?.at(-1)?.savingsAccountId || 0));
  }
  canRename(row: Pocket): boolean {
    return (
      this.capabilities().data?.pocketRelationships === true &&
      row.relationshipStatus === 'LINKED' &&
      this.access.has('MANAGE_SAVINGS_POCKET') &&
      this.access.has('READ_SAVINGS_ACCOUNT_RELATIONSHIP')
    );
  }
  rename(row: Pocket): void {
    if (!this.canRename(row)) return;
    const ref = this.trackDialog(
      this.dialog.open(PocketNameDialogComponent, { width: '480px', maxWidth: '100vw', data: row })
    );

    this.scoped(ref.afterClosed()).subscribe((saved) => {
      if (saved) this.reload();
    });
  }
  checkClosure(row: Pocket): void {
    const state = this.closure.get(row.savingsAccountId) || resource<Eligibility>();
    this.closure.set(row.savingsAccountId, state);
    if (state().loading) return;
    this.read(state, this.api.closure(this.clientId, row.savingsAccountId));
  }
}
