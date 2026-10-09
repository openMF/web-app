/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CreditOriginationBoard, CreditOriginationStageStatus } from '../../models/credit-origination-board.model';
import { LoansService } from '../../loans.service';

type CreditOriginationError = 'unauthorized' | 'forbidden' | 'not-found' | 'generic';

@Component({
  selector: 'mifosx-credit-origination-status',
  templateUrl: './credit-origination-status.component.html',
  styleUrls: ['./credit-origination-status.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DatePipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatChip,
    MatIcon,
    MatProgressSpinner,
    NgClass
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditOriginationStatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly loansService = inject(LoansService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  board: CreditOriginationBoard | null = null;
  isLoading = true;
  isUnavailable = false;
  error: CreditOriginationError | null = null;

  private creditApplicationId: string;

  ngOnInit(): void {
    const creditApplicationId = this.route.parent?.snapshot.paramMap.get('loanId');
    if (!creditApplicationId) {
      this.isLoading = false;
      this.isUnavailable = true;
      return;
    }

    this.creditApplicationId = creditApplicationId;
    this.loadBoard();
  }

  loadBoard(): void {
    this.isLoading = true;
    this.error = null;
    this.board = null;

    this.loansService
      .getCreditOriginationBoard(this.creditApplicationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (board) => {
          this.board = board;
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.error =
            error.status === 401
              ? 'unauthorized'
              : error.status === 403
                ? 'forbidden'
                : error.status === 404
                  ? 'not-found'
                  : 'generic';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  statusClass(status: CreditOriginationStageStatus): string {
    return `status-${status.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
  }

  isTerminal(status: CreditOriginationStageStatus): boolean {
    return [
      'REJECTED',
      'BLOCKED',
      'FAILED',
      'CANCELLED',
      'WITHDRAWN',
      'WRITTEN_OFF'
    ].includes(status);
  }
}
