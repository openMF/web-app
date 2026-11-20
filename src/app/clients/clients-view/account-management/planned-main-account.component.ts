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
import { Arrangement, PlannedCapabilities } from './account-management.model';
import { ClientSection, errorKey, positiveId, resource } from './account-management.state';
import { ResourceStateComponent } from './resource-state.component';
import { AccountStatusComponent } from './account-status.component';
import { PlannedAccountDetailsComponent } from './planned-account-details.component';
import { PlannedConfigurationDialogComponent } from './planned-configuration-dialog.component';

@Component({
  selector: 'mifosx-planned-main-account',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatExpansionModule,
    ResourceStateComponent,
    AccountStatusComponent,
    PlannedAccountDetailsComponent
  ],
  templateUrl: './planned-main-account.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedMainAccountComponent extends ClientSection {
  readonly access = inject(AccountManagementAccess);
  private readonly api = inject(PlannedAccountsService);
  private readonly dialog = inject(MatDialog);
  readonly capabilities = resource<PlannedCapabilities>();
  readonly arrangements = resource<Arrangement[]>();
  protected reset(): void {
    this.capabilities.set({ data: null, loading: false, error: null });
    this.arrangements.set({ data: null, loading: false, error: null });
    if (!positiveId(this.clientId) || !this.access.has('READ_PLANNED_SAVINGS')) return;
    this.capabilities.set({ data: null, loading: true, error: null });
    this.scoped(this.api.template()).subscribe({
      next: (data) => {
        this.capabilities.set({ data, loading: false, error: null });
        this.load();
      },
      error: (error) => this.capabilities.set({ data: null, loading: false, error: errorKey(error, true) })
    });
  }
  reload(): void {
    this.ngOnChanges();
  }
  load(): void {
    this.page(this.arrangements, this.api.arrangements(this.clientId, this.arrangements().data?.at(-1)?.id || ''));
  }
  get canConfigure(): boolean {
    return (
      this.capabilities().data?.arrangementConfiguration === true &&
      this.access.has('CONFIGURE_PLANNED_SAVINGS') &&
      this.access.has('READ_SAVINGS_PRODUCT_POLICY')
    );
  }
  configure(row?: Arrangement): void {
    if (!this.canConfigure || (row && (row.savingsAccountId != null || row.configuration.status === 'CANCELLED')))
      return;
    const ref = this.trackDialog(
      this.dialog.open(PlannedConfigurationDialogComponent, {
        width: '768px',
        maxWidth: '100vw',
        data: { clientId: this.clientId, arrangement: row }
      })
    );

    this.scoped(ref.afterClosed()).subscribe((saved) => {
      if (saved) this.reload();
    });
  }
}
