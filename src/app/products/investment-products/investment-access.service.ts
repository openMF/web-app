/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class InvestmentAccessService {
  private authentication = inject(AuthenticationService);
  get userId(): number | null {
    return this.authentication.getCredentials()?.userId ?? null;
  }
  has(permission: string): boolean {
    const permissions = this.authentication.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }
}
export interface InvestmentEditable {
  readonly dirty: boolean;
  readonly busy: boolean;
}
export function confirmInvestmentDiscard(dialog: MatDialog, translate: TranslateService) {
  return dialog
    .open(ConfirmationDialogComponent, {
      data: {
        heading: translate.instant('Investment.unsaved'),
        dialogContext: translate.instant('Investment.discard'),
        type: 'warning'
      }
    })
    .afterClosed()
    .pipe(map((result) => !!result?.confirm));
}
export const investmentUnsavedGuard: CanDeactivateFn<InvestmentEditable> = (component) =>
  !component.busy && (!component.dirty || confirmInvestmentDiscard(inject(MatDialog), inject(TranslateService)));
