/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { MatPrefix } from '@angular/material/form-field';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { LoanFormField, LoanFormSection } from '../loan-form.model';
import { applyVisibility, buildFormGroup, orderedFields } from '../loan-form';

/** Renders one loan application section from its description; add a field type by adding a case to the template. */
@Component({
  selector: 'mifosx-loan-form-section',
  templateUrl: './loan-form-section.component.html',
  styleUrls: ['./loan-form-section.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPrefix,
    MatRadioGroup,
    MatRadioButton,
    NepaliDateInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanFormSectionComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) section: LoanFormSection;

  form: FormGroup;
  fields: LoanFormField[] = [];

  ngOnInit(): void {
    this.fields = orderedFields(this.section);
    this.form = buildFormGroup(this.section);
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => applyVisibility(this.section, this.form));
  }

  isShown(field: LoanFormField): boolean {
    return field.type === 'readonly' || this.form.controls[field.key].enabled;
  }

  /** The first broken rule of a touched field, as a translation key and its values. */
  error(field: LoanFormField): { key: string; params?: object } | null {
    const control = this.form.controls[field.key];
    if (!control.errors || !control.touched) return null;
    const errors = control.errors;
    if (errors['required']) return { key: 'loanForm.required' };
    if (errors['min']) return { key: 'loanForm.min', params: { min: field.min } };
    if (errors['max']) return { key: 'loanForm.max', params: { max: field.max } };
    if (errors['minlength']) return { key: 'loanForm.minLength', params: { length: field.minLength } };
    if (errors['maxlength']) return { key: 'loanForm.maxLength', params: { length: field.maxLength } };
    if (errors['pattern']) return { key: field.integer ? 'loanForm.wholeNumber' : 'loanForm.pattern' };
    return { key: 'loanForm.invalid' };
  }
}
