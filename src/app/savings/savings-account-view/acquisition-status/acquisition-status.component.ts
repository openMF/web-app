/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AcquisitionBoard } from '../../models/acquisition-board.model';
import { SavingsService } from '../../savings.service';

type AcquisitionError = 'forbidden' | 'not-found' | 'generic';

@Component({
  selector: 'mifosx-acquisition-status',
  templateUrl: './acquisition-status.component.html',
  styleUrls: ['./acquisition-status.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButton,
    MatCard,
    MatCardContent,
    MatChip,
    MatIcon,
    MatProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcquisitionStatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly savingsService = inject(SavingsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  board: AcquisitionBoard | null = null;
  isLoading = true;
  isUnavailable = false;
  error: AcquisitionError | null = null;

  private clientId: string | number;
  private savingsAccountId: string | number;

  ngOnInit(): void {
    const accountData = this.route.parent?.snapshot.data['savingsAccountData'];
    const clientId = accountData?.clientId;
    const savingsAccountId = accountData?.id;

    if (clientId === null || clientId === undefined || savingsAccountId === null || savingsAccountId === undefined) {
      this.isLoading = false;
      this.isUnavailable = true;
      return;
    }

    this.clientId = clientId;
    this.savingsAccountId = savingsAccountId;
    this.loadBoard();
  }

  loadBoard(): void {
    this.isLoading = true;
    this.error = null;
    this.board = null;

    this.savingsService
      .getAcquisitionBoard(this.clientId, this.savingsAccountId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (board) => {
          this.board = board;
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.status === 403 ? 'forbidden' : error.status === 404 ? 'not-found' : 'generic';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
  }
}
