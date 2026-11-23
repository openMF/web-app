/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { MembershipService } from '../membership.service';
import { MembershipExit } from '../membership.models';

export interface MembershipExitDialogData {
  mode: 'request' | 'refund';
  clientId: number;
  /** The member's joining date or the date the request was settled: nothing may be dated before it */
  minDate?: string;
  /** Refund: the request to pay back */
  exit?: MembershipExit;
}

/**
 * A member asks to leave (date, reason), or the shares are paid back (date, receipt number, and the amount: read-only
 * when the member still holds shares, typed when none are left). fineract-dbug #125, docs/share-rules-and-leaving.md.
 */
@Component({
  selector: 'mifosx-membership-exit-dialog',
  templateUrl: './membership-exit-dialog.component.html',
  styleUrls: ['./membership-exit-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    NepaliDateInputComponent,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipExitDialogComponent {
  private dialogRef = inject<MatDialogRef<MembershipExitDialogComponent, MembershipExit>>(MatDialogRef);
  private membershipService = inject(MembershipService);
  private settingsService = inject(SettingsService);
  private dates = inject(Dates);
  private formBuilder = inject(FormBuilder);
  readonly data = inject<MembershipExitDialogData>(MAT_DIALOG_DATA);

  readonly refund = this.data.mode === 'refund';
  /** No shares left to pay back (paid on Fineract's own screen): the amount must be typed. */
  readonly typeAmount = this.refund && !(this.data.exit?.kitta ?? 0);
  readonly maxDate = this.settingsService.businessDate ?? new Date();
  readonly minDate = this.data.minDate ? this.fromIso(this.data.minDate) : null;
  readonly busy = signal(false);

  readonly form = this.formBuilder.group({
    date: [
      this.maxDate as Date | null,
      Validators.required
    ],
    reason: [
      '',
      Validators.maxLength(1000)
    ],
    receiptNumber: [
      '',
      Validators.maxLength(50)
    ],
    amount: [
      null as number | null,
      this.typeAmount ? [
            Validators.required,
            Validators.min(0.01)
          ] : []
    ]
  });

  submit(): void {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    const v = this.form.getRawValue();
    const text = (s: string | null | undefined) => (s ?? '').trim() || undefined;
    const date = this.dates.formatDate(v.date, 'yyyy-MM-dd');
    const call = this.refund
      ? this.membershipService.exitCommand(this.data.exit.id, 'refund', {
          date,
          refundReceiptNumber: text(v.receiptNumber),
          refundAmount: this.typeAmount ? Number(v.amount) : undefined
        })
      : this.membershipService.requestExit({
          clientId: this.data.clientId,
          requestedOn: date,
          reason: text(v.reason)
        });
    call.subscribe({
      next: (done) => this.dialogRef.close(done),
      error: () => this.busy.set(false)
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private fromIso(iso: string): Date {
    const [
      y,
      m,
      d
    ] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}
