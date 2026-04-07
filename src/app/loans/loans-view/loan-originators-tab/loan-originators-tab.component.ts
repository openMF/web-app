/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';
import { LoansService } from 'app/loans/loans.service';
import { LoanOriginator } from 'app/loans/models/loan-account.model';
import { LoanStatus } from 'app/loans/models/loan-status.model';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountTabBaseComponent } from '../loan-account-tab-base.component';

@Component({
  selector: 'mifosx-loan-originators-tab',
  templateUrl: './loan-originators-tab.component.html',
  styleUrl: './loan-originators-tab.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatIconButton,
    FaIconComponent
  ]
})
export class LoanOriginatorsTabComponent extends LoanAccountTabBaseComponent {
  private route = inject(ActivatedRoute);
  private loansService = inject(LoansService);
  private translateService = inject(TranslateService);
  private dialog = inject(MatDialog);

  loanOriginatorsData: LoanOriginator[] = [];
  loanId: string | null = null;
  clientId: string | null = null;

  loanStatus: LoanStatus | null = null;

  loanoriginatorsColumns: string[] = [
    'id',
    'externalId',
    'name',
    'status',
    'originatorType',
    'channelType',
    'actions'
  ];

  constructor() {
    super();
    this.clientId = this.route.parent.parent.snapshot.paramMap.get('clientId');
    this.loanId = this.route.parent?.parent?.snapshot.paramMap.get('loanId');
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanStatus = data.loanDetailsData.status;
    });
    this.route.parent.data.subscribe((data: { loanOriginatorsData: any }) => {
      this.loanOriginatorsData = data.loanOriginatorsData.originators;
    });
  }

  detachLoanOriginator(loanOriginator: LoanOriginator): void {
    if (!this.loanId || loanOriginator.id == null) {
      console.error('Invalid loan ID or originator ID');
      return;
    }
    const detachCodeDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Loan Originators'),
        dialogContext:
          this.translateService.instant('labels.buttons.Delete') +
          ' ' +
          this.translateService.instant('labels.inputs.Loan Originator') +
          ' ' +
          loanOriginator.name
      }
    });
    detachCodeDialogRef.afterClosed().subscribe((response?: { confirm?: boolean }) => {
      if (response?.confirm && this.loanId) {
        this.loansService.detachLoanOriginator(this.loanId, String(loanOriginator.id)).subscribe((response) => {
          this.reload();
        });
      }
    });
  }
}
