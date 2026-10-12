/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClosingCheck } from './end-of-day-closing.models';
@Component({ selector: 'mifosx-closing-checks', imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatTableModule
  ], templateUrl: './closing-checks-dialog.component.html' })
export class ClosingChecksDialogComponent {
  readonly data = inject<{ checks: ClosingCheck[]; selected: ClosingCheck[] }>(MAT_DIALOG_DATA);
  selected = [...this.data.selected];
  readonly fields = [
    'date',
    'currencyCode',
    'type',
    'bank',
    'reference',
    'username',
    'cashierId',
    'amount'
  ] as const;
  readonly columns = [
    'select',
    ...this.fields
  ];
  isSelected(check: ClosingCheck): boolean {
    return this.selected.some((c) => c.id === check.id && c.source === check.source);
  }
  toggle(check: ClosingCheck): void {
    this.selected = this.isSelected(check)
      ? this.selected.filter((c) => c.id !== check.id || c.source !== check.source)
      : [
          ...this.selected,
          check
        ];
  }
}
