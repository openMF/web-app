/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Location, NgIf, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { AccountTransfersService } from '../account-transfers.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    NgClass,
    MatDivider,
    DateFormatPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAccountTransferComponent {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private dialog = inject(MatDialog);
  private accountTransfersService = inject(AccountTransfersService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  viewAccountTransferData: any;
  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Location} location Location.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

  transferToClient(toClient: any): string {
    return `/#/clients/${toClient.id}`;
  }

  transferToAccount(toClient: any, toAccount: any): string {
    return `/#/clients/${toClient.id}/savings-accounts/${toAccount.id}`;
  }

  goBack(): void {
    this.location.back();
  }

  undoTransfer(): void {
    const undoAccountTransferDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.undo_account_transfer'),
        dialogContext: this.translateService.instant('labels.dialogContext.undo_account_transfer')
      }
    });
    undoAccountTransferDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.confirm) {
        this.accountTransfersService.undoAccountTransfer(this.viewAccountTransferData.id).subscribe(() => {
          this.goBack();
        });
      }
    });
  }

  transactionColor(): string {
    return this.viewAccountTransferData.reversed ? 'undo' : 'active';
  }
}
