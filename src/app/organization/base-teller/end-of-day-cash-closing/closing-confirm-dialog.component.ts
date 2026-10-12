/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClosingRecord, ClosingRequest } from './end-of-day-closing.models';
import { EndOfDayClosingService } from './end-of-day-closing.service';
import { ClosingSummaryComponent } from './closing-summary.component';
import { closingError } from './end-of-day-closing-error';
@Component({ selector: 'mifosx-closing-confirm', imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    ClosingSummaryComponent
  ], templateUrl: './closing-confirm-dialog.component.html' })
export class ClosingConfirmDialogComponent implements OnDestroy {
  readonly data = inject<{ request: ClosingRequest; preview: ClosingRecord }>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialogRef<ClosingConfirmDialogComponent>);
  private readonly service = inject(EndOfDayClosingService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form;
  private readonly cdr = inject(ChangeDetectorRef);
  pending = false;
  error = '';
  mustPreview = false;
  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.nonNullable.group({ username: [
        '',
        Validators.required
      ], credential: [
        '',
        Validators.required
      ] });
  }
  accept(): void {
    if (this.pending || this.mustPreview || this.form.invalid) return;
    this.pending = true;
    this.dialog.disableClose = true;
    this.error = '';
    const request = this.service.complete(
      this.data.request,
      this.form.controls.username.value.trim(),
      this.form.controls.credential.value
    );
    this.form.controls.credential.reset('');
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending = false;
          this.cdr.markForCheck();
          this.dialog.disableClose = false;
        })
      )
      .subscribe({
        next: (result) => this.dialog.close(result),
        error: (error) => {
          this.error = closingError(error);
          this.mustPreview = ![
            'eod.invalidAuthorization',
            'eod.network'
          ].includes(this.error);
        }
      });
  }
  ngOnDestroy(): void {
    this.form.reset();
  }
}
