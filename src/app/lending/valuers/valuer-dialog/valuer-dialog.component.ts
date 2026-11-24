/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Valuer, ValuerInput, ValuersService, fiscalYearLabel } from '../valuers.service';

export interface ValuerDialogData {
  /** The valuer to change; none to add one. */
  valuer?: Valuer;
}

/** How many fiscal years before and after the current one the year list offers. */
const YEARS_BACK = 5;
const YEARS_AHEAD = 1;

/** Add or change a valuer. A registered technical valuer needs a registration number and the fiscal year listed for. */
@Component({
  selector: 'mifosx-valuer-dialog',
  templateUrl: './valuer-dialog.component.html',
  styleUrls: ['./valuer-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatSlideToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuerDialogComponent {
  readonly data = inject<ValuerDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<ValuerDialogComponent, Valuer>);
  private fb = inject(FormBuilder);
  private valuers = inject(ValuersService);
  private destroyRef = inject(DestroyRef);

  readonly editing = !!this.data?.valuer;
  readonly busy = signal(false);
  readonly yearLabel = fiscalYearLabel;
  /** The fiscal years to pick from (as the BS year each starts in), newest first. */
  readonly years: number[];

  readonly form = this.fb.group({
    name: [
      this.data?.valuer?.name ?? '',
      [
        Validators.required,
        Validators.maxLength(200),
        notBlank
      ]
    ],
    registered: [this.data?.valuer?.registered ?? false],
    registrationNo: [
      this.data?.valuer?.registrationNo ?? '',
      Validators.maxLength(100)
    ],
    fiscalYear: [this.data?.valuer?.fiscalYear ?? (null as number | null)],
    phone: [
      this.data?.valuer?.phone ?? '',
      Validators.maxLength(50)
    ],
    address: [
      this.data?.valuer?.address ?? '',
      Validators.maxLength(300)
    ],
    active: [this.data?.valuer?.active ?? true]
  });

  constructor() {
    const current = this.valuers.currentFiscalYear();
    const years = new Set<number>();
    if (current) {
      for (let y = current + YEARS_AHEAD; y >= current - YEARS_BACK; y--) {
        years.add(y);
      }
    }
    const saved = this.data?.valuer?.fiscalYear;
    if (saved) {
      years.add(saved);
    }
    this.years = [...years].sort((a, b) => b - a);
    if (!this.editing && current) {
      this.form.controls.fiscalYear.setValue(current);
    }

    this.applyRegistered(this.form.controls.registered.value);
    this.form.controls.registered.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((registered) => this.applyRegistered(registered));
  }

  get registered(): boolean {
    return !!this.form.controls.registered.value;
  }

  /** Registration no. and fiscal year are required only for a registered technical valuer. */
  private applyRegistered(registered: boolean): void {
    const { registrationNo, fiscalYear } = this.form.controls;
    if (registered) {
      registrationNo.setValidators([
        Validators.required,
        Validators.maxLength(100),
        notBlank
      ]);
      fiscalYear.setValidators(Validators.required);
    } else {
      registrationNo.setValidators(Validators.maxLength(100));
      fiscalYear.clearValidators();
    }
    registrationNo.updateValueAndValidity({ emitEvent: false });
    fiscalYear.updateValueAndValidity({ emitEvent: false });
  }

  save(): void {
    if (this.busy()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body: ValuerInput = {
      name: v.name.trim(),
      registered: !!v.registered,
      registrationNo: blankToNull(v.registrationNo),
      fiscalYear: v.fiscalYear ?? null,
      phone: blankToNull(v.phone),
      address: blankToNull(v.address),
      active: !!v.active
    };
    this.busy.set(true);
    const call = this.editing ? this.valuers.update(this.data.valuer.id, body) : this.valuers.add(body);
    // A refusal shows the backend's message through the app's error alert; the dialog stays open to fix it.
    call.subscribe({
      next: (saved) => this.ref.close(saved),
      error: () => this.busy.set(false)
    });
  }
}

function blankToNull(value: string | null | undefined): string | null {
  const text = (value ?? '').trim();
  return text ? text : null;
}

/** Spaces alone are not a name or a number. */
function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length && !value.trim() ? { required: true } : null;
}
