/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';
import { RateMatrix, RateTemplate } from './investment-product.models';

type AmountBandForm = FormGroup<{
  lower: FormControl<string>;
  upper: FormControl<string>;
  upperInclusive: FormControl<boolean>;
}>;
type TermBandForm = FormGroup<{
  minimumDays: FormControl<number | null>;
  maximumDays: FormControl<number | null>;
}>;
export type RateMatrixForm = FormGroup<{
  amountBands: FormArray<AmountBandForm>;
  termBands: FormArray<TermBandForm>;
  rates: FormArray<FormArray<FormControl<string>>>;
}>;

function amountBandForm(fb: FormBuilder, lower = '', upper = '', upperInclusive = false): AmountBandForm {
  return fb.nonNullable.group({ lower: [
      lower,
      Validators.required
    ], upper, upperInclusive });
}
function termBandForm(fb: FormBuilder, minimumDays: number | null, maximumDays: number | null): TermBandForm {
  return fb.group({
    minimumDays: [
      minimumDays,
      Validators.required
    ],
    maximumDays: [
      maximumDays,
      Validators.required
    ]
  });
}

export function matrixForm(fb: FormBuilder, matrix: RateMatrix): RateMatrixForm {
  return fb.group({
    amountBands: fb.array(
      matrix.amountBands.map((band) => amountBandForm(fb, band.lower, band.upper ?? '', band.upperInclusive))
    ),
    termBands: fb.array(matrix.termBands.map((band) => termBandForm(fb, band.minimumDays, band.maximumDays))),
    rates: fb.array(
      matrix.amountBands.map((_, amount) =>
        fb.array(
          matrix.termBands.map((__, term) =>
            fb.nonNullable.control(
              matrix.cells.find((cell) => cell.amountBand === amount && cell.termBand === term)?.annualRatePercent ??
                '',
              Validators.required
            )
          )
        )
      )
    )
  });
}
export function readMatrixForm(form: RateMatrixForm, currencyCode: string): RateMatrix {
  const value = form.getRawValue();
  return {
    currencyCode,
    amountBands: value.amountBands.map((band) => ({
      ...band,
      upper: band.upper === '' ? null : band.upper
    })),
    // Blank term controls are invalid. A zero boundary also fails matrix validation.
    termBands: value.termBands.map(({ minimumDays, maximumDays }) => ({
      minimumDays: minimumDays ?? 0,
      maximumDays: maximumDays ?? 0
    })),
    cells: value.rates.flatMap((rates, amountBand) =>
      rates.map((annualRatePercent, termBand) => ({ amountBand, termBand, annualRatePercent }))
    )
  };
}
@Component({
  selector: 'mifosx-investment-rate-matrix',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './investment-rate-matrix.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentRateMatrixComponent {
  @Input({ required: true }) form: RateMatrixForm;
  @Input({ required: true }) template: RateTemplate;
  @Input() editable = false;
  @Input() busy = false;
  constructor(private fb: FormBuilder) {}
  get amounts() {
    return this.form.controls.amountBands;
  }
  get terms() {
    return this.form.controls.termBands;
  }
  get rates() {
    return this.form.controls.rates;
  }
  get canAddAmount() {
    return (
      this.editable &&
      !this.busy &&
      this.amounts.length < this.template.maximumAmountBands &&
      (this.amounts.length + 1) * this.terms.length <= this.template.maximumCells
    );
  }
  get canAddTerm() {
    return (
      this.editable &&
      !this.busy &&
      this.terms.length < this.template.maximumTermBands &&
      (this.terms.length + 1) * this.amounts.length <= this.template.maximumCells
    );
  }
  addAmount() {
    if (!this.canAddAmount) return;
    this.amounts.push(amountBandForm(this.fb));
    this.rates.push(this.fb.array(this.terms.controls.map(() => this.fb.nonNullable.control('', Validators.required))));
    this.form.markAsDirty();
  }
  addTerm() {
    if (!this.canAddTerm) return;
    this.terms.push(termBandForm(this.fb, null, null));
    this.rates.controls.forEach((row) => row.push(this.fb.nonNullable.control('', Validators.required)));
    this.form.markAsDirty();
  }
  removeAmount(index: number) {
    if (!this.editable || this.busy || this.amounts.length <= 1) return;
    this.amounts.removeAt(index);
    this.rates.removeAt(index);
    this.form.markAsDirty();
  }
  removeTerm(index: number) {
    if (!this.editable || this.busy || this.terms.length <= 1) return;
    this.terms.removeAt(index);
    this.rates.controls.forEach((row) => row.removeAt(index));
    this.form.markAsDirty();
  }
}
