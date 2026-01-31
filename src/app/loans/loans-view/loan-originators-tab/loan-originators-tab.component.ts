/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, inject } from '@angular/core';
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
import { LoanOriginator } from 'app/loans/models/loan-account.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatRow
  ]
})
export class LoanOriginatorsTabComponent {
  private route = inject(ActivatedRoute);

  loanOriginatorsData: LoanOriginator[] = [];
  loanId: number | null = null;

  loanoriginatorsColumns: string[] = [
    'id',
    'externalId',
    'name',
    'status',
    'originatorTypeId',
    'channelTypeId'
  ];

  constructor() {
    const loanIdParam = this.route.parent?.parent?.snapshot.paramMap.get('loanId');
    this.loanId = loanIdParam ? Number(loanIdParam) : null;
    this.route.parent.data.subscribe((data: { loanOriginatorsData: any }) => {
      this.loanOriginatorsData = data.loanOriginatorsData.originators;
    });
  }
}
