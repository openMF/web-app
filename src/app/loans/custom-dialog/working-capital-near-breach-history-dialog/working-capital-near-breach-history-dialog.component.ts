/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import {
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
} from '@angular/material/table';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { YesnoPipe } from 'app/pipes/yesno.pipe';
import { WorkingCapitalNearBreachData } from 'app/loans/models/working-capital/working-capital-loan-account.model';

@Component({
  selector: 'mifosx-working-capital-near-breach-history-dialog',
  templateUrl: './working-capital-near-breach-history-dialog.component.html',
  styleUrls: ['./working-capital-near-breach-history-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
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
    FormatNumberPipe,
    YesnoPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkingCapitalNearBreachHistoryDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<WorkingCapitalNearBreachHistoryDialogComponent>>(MatDialogRef);
  data = inject<{ nearBreachData: WorkingCapitalNearBreachData[] }>(MAT_DIALOG_DATA);

  groupHeaderColumns: string[] = [
    'grpBlankStart',
    'grpPrevious',
    'grpNew',
    'grpBlankEnd'
  ];

  displayedColumns: string[] = [
    'effectiveDate',
    'previousThreshold',
    'previousFrequency',
    'newThreshold',
    'newFrequency',
    'reversed'
  ];

  ngOnInit() {
    this.dialogRef.updateSize('800px');
  }
}
