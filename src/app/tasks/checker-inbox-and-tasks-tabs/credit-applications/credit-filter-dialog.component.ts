/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { creditFilterError } from './credit-workspace.utils';
import {
  CreditCurrencyState,
  CreditFilterDialogData,
  CreditFilterKind,
  CreditFilterPatch,
  CreditFilterValues
} from './credit-filter-dialog.model';

@Component({
  selector: 'mifosx-credit-filter-dialog',
  templateUrl: './credit-filter-dialog.component.html',
  styles: ['.filter-fields { display: grid; gap: 8px; padding-top: 8px; }'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditFilterDialogComponent {
  readonly data = inject<CreditFilterDialogData>(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<CreditFilterDialogComponent, CreditFilterPatch>>(MatDialogRef);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private readonly headings: Record<CreditFilterKind, string> = {
    dates: 'labels.inputs.Submitted Date',
    amount: 'labels.inputs.Amount',
    location: 'labels.inputs.State / Municipality'
  };
  readonly heading = this.headings[this.data.kind];
  form = this.formBuilder.group({
    submittedFrom: this.formBuilder.control<Exclude<CreditFilterValues['submittedFrom'], undefined>>(
      this.data.value.submittedFrom ?? null
    ),
    submittedTo: this.formBuilder.control<Exclude<CreditFilterValues['submittedTo'], undefined>>(
      this.data.value.submittedTo ?? null
    ),
    minAmount: this.formBuilder.control<Exclude<CreditFilterValues['minAmount'], undefined>>(
      this.data.value.minAmount ?? null
    ),
    maxAmount: this.formBuilder.control<Exclude<CreditFilterValues['maxAmount'], undefined>>(
      this.data.value.maxAmount ?? null
    ),
    currencyCode: this.formBuilder.control(this.data.value.currencyCode ?? ''),
    stateProvinceId: this.formBuilder.control<Exclude<CreditFilterValues['stateProvinceId'], undefined>>(
      this.data.value.stateProvinceId ?? null
    ),
    municipality: this.formBuilder.control(this.data.value.municipality ?? '')
  });
  currencyState: CreditCurrencyState = { options: [], loading: true, failed: false };
  error = '';
  constructor() {
    this.data.currencies$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
      this.currencyState = state;
      this.changeDetectorRef.markForCheck();
    });
  }
  clear(): void {
    this.form.reset();
    this.apply();
  }
  apply(): void {
    const patch = this.filterPatch();
    this.error = creditFilterError(patch);
    if (this.form.invalid) this.error = 'credits.invalidDate';
    if (
      this.data.kind === 'amount' &&
      'currencyCode' in patch &&
      patch.currencyCode &&
      !this.currencyState.options.some((currency) => currency.code === patch.currencyCode)
    )
      this.error = 'credits.currencyUnavailable';
    if (!this.error) this.dialogRef.close(patch);
  }
  private filterPatch(): CreditFilterPatch {
    const value = this.form.getRawValue();
    switch (this.data.kind) {
      case 'dates':
        return { submittedFrom: value.submittedFrom, submittedTo: value.submittedTo };
      case 'amount':
        return { minAmount: value.minAmount, maxAmount: value.maxAmount, currencyCode: value.currencyCode };
      case 'location':
        return { stateProvinceId: value.stateProvinceId, municipality: value.municipality };
    }
  }
}
