/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { merge, startWith } from 'rxjs';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MemberAddressDraft, MemberAddressView, TemporaryAddressChoice } from '../member-address.model';
import { createMemberAddressForm, previewMemberAddress, toMemberAddressRequest } from '../member-address-form';
import { MemberAddressFieldsComponent } from '../member-address-fields/member-address-fields.component';
import { NepalLocationIndex } from '../nepal-location-index';
import { NepalLocationService } from '../nepal-location.service';

/**
 * The address step of "Create member": the permanent address, which is required, and optionally a temporary one.
 *
 * Nothing is saved here. The member has to exist first, so the create page reads {@link draft} and saves it once the
 * member is created. "No temporary address" is the default, so the system never records a temporary address that
 * nobody gave.
 */
@Component({
  selector: 'mifosx-member-address-step',
  templateUrl: './member-address-step.component.html',
  styleUrls: ['./member-address-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatProgressBar,
    MatRadioGroup,
    MatRadioButton,
    MatStepperPrevious,
    MatStepperNext,
    MemberAddressFieldsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddressStepComponent {
  private readonly locationService = inject(NepalLocationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly permanentForm = createMemberAddressForm();
  readonly temporaryForm = createMemberAddressForm();
  readonly temporaryChoice = new FormControl<TemporaryAddressChoice>('NONE', { nonNullable: true });
  readonly choices: TemporaryAddressChoice[] = [
    'NONE',
    'SAME',
    'DIFFERENT'
  ];

  readonly locations = signal<NepalLocationIndex | null>(null);
  readonly loadFailed = signal(false);

  private readonly changes = toSignal(
    merge(this.permanentForm.valueChanges, this.temporaryForm.valueChanges, this.temporaryChoice.valueChanges).pipe(
      startWith(null)
    )
  );
  readonly choice = toSignal(this.temporaryChoice.valueChanges, { initialValue: this.temporaryChoice.value });

  /** True when the step can be left: the locations are loaded and every address that is needed is complete. */
  readonly valid = computed(() => {
    this.changes();
    if (!this.locations() || !this.permanentForm.valid) {
      return false;
    }
    return this.choice() !== 'DIFFERENT' || this.temporaryForm.valid;
  });

  readonly permanentPreview = computed<MemberAddressView | null>(() => {
    this.changes();
    const index = this.locations();
    return index ? previewMemberAddress(this.permanentForm, index) : null;
  });

  readonly temporaryPreview = computed<MemberAddressView | null>(() => {
    this.changes();
    const index = this.locations();
    switch (this.choice()) {
      case 'SAME':
        return this.permanentPreview();
      case 'DIFFERENT':
        return index ? previewMemberAddress(this.temporaryForm, index) : null;
      default:
        return null;
    }
  });

  constructor() {
    this.loadLocations();
    // Fields shown by "A different address" start pristine, whatever happened the last time they were shown.
    this.temporaryChoice.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.temporaryForm.markAsUntouched());
  }

  loadLocations(): void {
    this.loadFailed.set(false);
    this.locationService
      .locations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (index) => this.locations.set(index),
        error: () => this.loadFailed.set(true)
      });
  }

  /** The addresses to save once the member exists, or `null` if the step is not complete. */
  draft(): MemberAddressDraft | null {
    if (!this.valid()) {
      return null;
    }
    const permanent = { sameAsPermanent: false, ...toMemberAddressRequest(this.permanentForm) };
    switch (this.temporaryChoice.value) {
      case 'SAME':
        return { permanent, temporary: { sameAsPermanent: true } };
      case 'DIFFERENT':
        return { permanent, temporary: { sameAsPermanent: false, ...toMemberAddressRequest(this.temporaryForm) } };
      default:
        return { permanent, temporary: null };
    }
  }

  markAllAsTouched(): void {
    this.permanentForm.markAllAsTouched();
    if (this.temporaryChoice.value === 'DIFFERENT') {
      this.temporaryForm.markAllAsTouched();
    }
  }
}
