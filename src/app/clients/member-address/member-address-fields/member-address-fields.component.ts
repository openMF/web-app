/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl } from '@angular/forms';
import { filter, startWith } from 'rxjs';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { injectNepaliFirst } from '../nepali-first';
import { MEMBER_ADDRESS_LIMITS } from '../member-address.model';
import { MemberAddressForm } from '../member-address-form';
import { LocationOption, NepalLocationIndex, bilingualName } from '../nepal-location-index';

interface Selection {
  provinceCode: string | null;
  districtCode: string | null;
  localLevelCode: string | null;
}

/**
 * Province → district → local level → ward, each list narrowed by the choice before it.
 *
 * Changing a level clears the levels below it, and each dropdown stays disabled until the one above it has a value,
 * so an impossible combination cannot be entered. A saved local level that has since been merged or renamed stays
 * selectable (with its province and district) so an old address can be shown and corrected.
 *
 * The component only edits the form it is given; saving is the parent's job.
 */
@Component({
  selector: 'mifosx-member-address-fields',
  templateUrl: './member-address-fields.component.html',
  styleUrls: ['./member-address-fields.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSelectSearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberAddressFieldsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly form = input.required<MemberAddressForm>();
  readonly locations = input.required<NepalLocationIndex>();
  /** The local level already saved for this address, kept selectable even if it is no longer active. */
  readonly savedLocalLevelCode = input<string | null>(null);

  readonly limits = MEMBER_ADDRESS_LIMITS;

  private readonly selection = signal<Selection>({ provinceCode: null, districtCode: null, localLevelCode: null });
  private readonly saved = computed(() => this.locations().find(this.savedLocalLevelCode()));

  readonly provinces = computed(() => this.locations().provinces(this.saved()?.provinceCode));
  readonly districts = computed(() =>
    this.locations().districts(this.selection().provinceCode, this.saved()?.districtCode)
  );
  readonly localLevels = computed(() => {
    const { provinceCode, districtCode } = this.selection();
    return this.locations().localLevels(provinceCode, districtCode, this.saved()?.combinedCode);
  });
  readonly wards = computed(() => this.locations().wards(this.selection().localLevelCode));

  private readonly nepaliFirst = injectNepaliFirst();

  /** Search boxes at the top of the province, district and local level lists. */
  readonly provinceSearch = new FormControl('', { nonNullable: true });
  readonly districtSearch = new FormControl('', { nonNullable: true });
  readonly localLevelSearch = new FormControl('', { nonNullable: true });

  readonly filteredProvinces = this.filtered(this.provinces, this.provinceSearch);
  readonly filteredDistricts = this.filtered(this.districts, this.districtSearch);
  readonly filteredLocalLevels = this.filtered(this.localLevels, this.localLevelSearch);

  ngOnInit(): void {
    const form = this.form();
    const { provinceCode, districtCode, localLevelCode, wardNo } = form.controls;
    this.selection.set({
      provinceCode: provinceCode.value,
      districtCode: districtCode.value,
      localLevelCode: localLevelCode.value
    });
    this.updateEnabledState();

    // Disabling or enabling the group re-emits every field's current value; only a real change may cascade.
    provinceCode.valueChanges
      .pipe(
        filter((code) => code !== this.selection().provinceCode),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((code) => {
        districtCode.reset(null, { emitEvent: false });
        localLevelCode.reset(null, { emitEvent: false });
        wardNo.reset(null, { emitEvent: false });
        this.selection.set({ provinceCode: code, districtCode: null, localLevelCode: null });
        this.updateEnabledState();
      });

    districtCode.valueChanges
      .pipe(
        filter((code) => code !== this.selection().districtCode),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((code) => {
        localLevelCode.reset(null, { emitEvent: false });
        wardNo.reset(null, { emitEvent: false });
        this.selection.update((current) => ({ ...current, districtCode: code, localLevelCode: null }));
        this.updateEnabledState();
      });

    localLevelCode.valueChanges
      .pipe(
        filter((code) => code !== this.selection().localLevelCode),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((code) => {
        // Keep the ward when it also exists in the new local level; most people only fix the municipality.
        if (wardNo.value !== null && !this.locations().wards(code).includes(wardNo.value)) {
          wardNo.reset(null, { emitEvent: false });
        }
        this.selection.update((current) => ({ ...current, localLevelCode: code }));
        this.updateEnabledState();
      });

    // A parent that disables the whole group (e.g. "same as permanent") re-enables every field at once;
    // put the dependent fields back in step when that happens.
    form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateEnabledState());
  }

  label(option: LocationOption): string {
    return bilingualName(option.nameEn, option.nameNp, this.nepaliFirst());
  }

  /** The options whose English or Nepali name contains the typed text, in any case. */
  private filtered(options: () => LocationOption[], search: FormControl<string>) {
    const term = toSignal(search.valueChanges.pipe(startWith('')), { initialValue: '' });
    return computed(() => {
      const text = term().trim().toLocaleLowerCase();
      return text ? options().filter((o) => `${o.nameEn} ${o.nameNp}`.toLocaleLowerCase().includes(text)) : options();
    });
  }

  private updateEnabledState(): void {
    const form = this.form();
    if (form.disabled) {
      return;
    }
    const { provinceCode, districtCode, localLevelCode, wardNo } = form.controls;
    setEnabled(districtCode, !!provinceCode.value);
    setEnabled(localLevelCode, !!districtCode.value);
    setEnabled(wardNo, !!localLevelCode.value);
  }
}

function setEnabled(control: AbstractControl, enabled: boolean): void {
  if (enabled && !control.enabled) {
    control.enable({ emitEvent: false });
  } else if (!enabled && control.enabled) {
    control.disable({ emitEvent: false });
  }
}
