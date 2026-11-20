/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClientSection, resource } from './account-management.state';
import { PlannedAudit } from './account-management.model';
import { PlannedAccountsService } from './planned-accounts.service';
import { AccountManagementAccess } from './account-management-access.service';
import { ResourceStateComponent } from './resource-state.component';
import { AccountStatusComponent } from './account-status.component';

@Component({
  selector: 'mifosx-planned-audit',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    ResourceStateComponent,
    AccountStatusComponent
  ],
  templateUrl: './planned-audit.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedAuditComponent extends ClientSection {
  @Input({ required: true }) kind: 'arrangements' | 'pockets';
  @Input({ required: true }) subjectId: number | string;
  private readonly api = inject(PlannedAccountsService);
  private readonly access = inject(AccountManagementAccess);
  readonly audit = resource<PlannedAudit[]>();
  readonly columns = [
    'operation',
    'outcome',
    'actor',
    'date'
  ];
  protected reset(): void {
    this.audit.set({ data: null, loading: false, error: null });
    if (this.access.has('READ_PLANNED_SAVINGS')) this.load();
  }
  load(): void {
    this.page(
      this.audit,
      this.api.history(this.clientId, this.kind, this.subjectId, this.audit().data?.at(-1)?.id || 0)
    );
  }
}
