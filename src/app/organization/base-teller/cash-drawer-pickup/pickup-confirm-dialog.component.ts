/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, Component, DestroyRef, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CashDrawerPickupService } from './cash-drawer-pickup.service';
import { PickupRecord, PickupRequest } from './cash-drawer-pickup.models';
import { PickupSummaryComponent } from './pickup-summary.component';
import { pickupError } from './pickup-error';

@Component({
  selector: 'mifosx-pickup-confirm-dialog',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    PickupSummaryComponent
  ],
  templateUrl: './pickup-confirm-dialog.component.html'
})
export class PickupConfirmDialogComponent implements OnDestroy {
  readonly data = inject<{ request: PickupRequest; preview: PickupRecord; uncertain?: boolean }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PickupConfirmDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly service = inject(CashDrawerPickupService);
  private readonly destroyRef = inject(DestroyRef);
  readonly form;
  busy = false;
  uncertain = this.data.uncertain === true;
  stale = false;
  error = '';
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
  confirm(): void {
    if (this.busy || this.form.invalid || this.stale) return;
    this.busy = true;
    this.error = '';
    this.service.pendingPickup = { request: this.data.request, preview: this.data.preview };
    // The credential exists only in the in-flight HTTP body; never keep it for retry.
    const operation = this.service.create(
      this.data.request,
      this.form.controls.username.value,
      this.form.controls.credential.value
    );
    this.form.controls.credential.reset('');
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.busy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (record) => {
          this.service.pendingPickup = undefined;
          this.ref.close(record);
        },
        error: (error) => {
          this.error = pickupError(error);
          this.uncertain ||= !error.status || error.status >= 500 || [
              408,
              409,
              429
            ].includes(error.status);
          if (!this.uncertain) this.service.pendingPickup = undefined;
          this.stale = !this.uncertain && this.error !== 'cashPickup.invalidAuthorization';
        }
      });
  }
  cancel(): void {
    if (this.busy) return;
    this.form.reset();
    this.ref.close(this.uncertain ? 'pending' : undefined);
  }
  ngOnDestroy(): void {
    this.form.reset();
  }
}
