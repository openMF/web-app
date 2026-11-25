/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { _ as extract } from '@ngx-translate/core';
import { PendingClient } from './client-approval.models';

@Component({
  selector: 'mifosx-client-approval-confirm-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  templateUrl: './client-approval-confirm-dialog.component.html',
  styles: ['ul { padding-inline-start: 24px; } li { margin-bottom: 8px; overflow-wrap: anywhere; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientApprovalConfirmDialogComponent {
  readonly data = inject<{ clients: PendingClient[]; activationDate: string; staffName?: string }>(MAT_DIALOG_DATA);
  readonly staffMessage = this.data.staffName
    ? extract('clientApproval.confirmStaff')
    : extract('clientApproval.keepStaff');
}
