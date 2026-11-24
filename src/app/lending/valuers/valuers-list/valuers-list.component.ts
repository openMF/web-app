/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Valuer, ValuersService, fiscalYearLabel } from '../valuers.service';
import { ValuerDialogComponent, ValuerDialogData } from '../valuer-dialog/valuer-dialog.component';

/**
 * The cooperative's list of valuers (fineract-dbug #322): the staff who value land and the registered technical
 * valuers. A land valuation can only name a valuer from this list. Valuers are deactivated, never deleted.
 */
@Component({
  selector: 'mifosx-valuers-list',
  templateUrl: './valuers-list.component.html',
  styleUrls: ['./valuers-list.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatIcon,
    MatProgressBar,
    MatSlideToggle,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuersListComponent implements OnInit {
  private valuers = inject(ValuersService);
  private dialog = inject(MatDialog);

  readonly columns = [
    'name',
    'type',
    'registrationNo',
    'fiscalYear',
    'phone',
    'active',
    'actions'
  ];
  readonly rows = signal<Valuer[]>([]);
  readonly loading = signal(false);
  /** Whether the list could not be read (no access, or the server refused). */
  readonly failed = signal(false);
  readonly showInactive = signal(false);
  readonly yearLabel = fiscalYearLabel;
  /** "2083/84": the fiscal year a registered valuer must be listed for to be used now. */
  readonly thisYear = fiscalYearLabel(this.valuers.currentFiscalYear());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.valuers.list(this.showInactive()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.failed.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.failed.set(true);
        this.loading.set(false);
      }
    });
  }

  toggleInactive(show: boolean): void {
    this.showInactive.set(show);
    this.load();
  }

  add(): void {
    this.open({});
  }

  edit(valuer: Valuer): void {
    this.open({ valuer });
  }

  private open(data: ValuerDialogData): void {
    this.dialog
      .open<ValuerDialogComponent, ValuerDialogData, Valuer>(ValuerDialogComponent, {
        data,
        width: '640px',
        maxWidth: '96vw',
        autoFocus: 'first-tabbable'
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.load();
        }
      });
  }
}
