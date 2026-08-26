/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { CoopLocation, CoopProfile, CoopProfileService } from '../../services/coop-profile.service';

@Component({
  selector: 'mifosx-coop-profile',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],

  templateUrl: './coop-profile.component.html',
  styleUrl: './coop-profile.component.scss'
})
export class CoopProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private coopProfileService = inject(CoopProfileService);

  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  /**
   * True once an existing profile has been
   * loaded successfully from the backend.
   *
   * Determines whether onSubmit() should
   * CREATE (POST) or UPDATE (PATCH).
   */
  isEditMode = false;

  // =====================================================
  // LOCATION DATA
  // =====================================================

  locations: CoopLocation[] = [];

  provinces: CoopLocation[] = [];

  districts: CoopLocation[] = [];

  localLevels: CoopLocation[] = [];

  wards: number[] = [];

  // =====================================================
  // PROFILE FORM
  // =====================================================

  profileForm = this.fb.nonNullable.group({
    coopRegdNo: [
      '',
      Validators.required
    ],

    nameNp: [
      '',
      Validators.required
    ],

    nameEn: [
      '',
      Validators.required
    ],

    dateOfRegistered: [
      '',
      Validators.required
    ],

    panNo: [
      '',
      Validators.required
    ],

    provinceId: [
      null as number | null,
      Validators.required
    ],

    districtId: [
      null as number | null,
      Validators.required
    ],

    localLevelId: [
      null as number | null,
      Validators.required
    ],

    wardNo: [
      null as number | null
    ],

    tole: [
      ''
    ],

    houseNo: [
      ''
    ],

    mobilePhone: [
      '',
      Validators.required
    ],

    officePhone: [
      ''
    ],

    logoUrl: [
      ''
    ],

    webUrl: [
      ''
    ],

    about: [
      ''
    ],

    remarks: [
      ''
    ]
  });

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadLocations();
  }

  // =====================================================
  // LOAD LOCATIONS
  // =====================================================

  private loadLocations(): void {
    this.coopProfileService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;

        // Create unique province list
        this.provinces = this.getUniqueProvinces();

        // After locations are loaded,
        // load existing profile
        this.loadProfile();
      },

      error: (error) => {
        this.errorMessage = 'Unable to load address information.';
      }
    });
  }

  // =====================================================
  // UNIQUE PROVINCES
  // =====================================================

  private getUniqueProvinces(): CoopLocation[] {
    const unique = new Map<string, CoopLocation>();

    for (const location of this.locations) {
      if (!unique.has(location.provinceCode)) {
        unique.set(location.provinceCode, location);
      }
    }

    return Array.from(unique.values());
  }

  // =====================================================
  // LOAD EXISTING PROFILE
  // =====================================================

  private loadProfile(): void {
    this.coopProfileService.getProfile().subscribe({
      next: (response) => {
        /*
         * First patch all profile values.
         *
         * Example:
         *
         * provinceId = 3
         * districtId = 27
         * localLevelId = 1
         * wardNo = 4
         */

        this.profileForm.patchValue(response);

        /*
         * patchValue() does NOT mark controls
         * as dirty, so at this point the form
         * is clean - any edits the user makes
         * from here on will correctly mark only
         * the touched controls as dirty.
         */

        /*
         * An existing profile was found -
         * subsequent saves must PATCH, not POST.
         */

        this.isEditMode = true;

        const provinceId = response.provinceId;

        const districtId = response.districtId;

        const localLevelId = response.localLevelId;

        // ---------------------------------------------
        // Build District dropdown
        // ---------------------------------------------

        if (provinceId !== null) {
          this.setDistricts(provinceId);
        }

        // ---------------------------------------------
        // Build Local Level dropdown
        // ---------------------------------------------

        if (provinceId !== null && districtId !== null) {
          this.setLocalLevels(districtId);
        }

        // ---------------------------------------------
        // Build Ward dropdown
        // ---------------------------------------------

        if (localLevelId !== null) {
          this.setWards(localLevelId);
        }
      },

      error: (error) => {
        /*
         * No profile yet is not a real error.
         */

        if (error?.error?.error === 'No profile submitted yet') {
          this.isEditMode = false;

          return;
        }

        this.errorMessage = error?.error?.message || error?.error?.error || 'Unable to load cooperative profile.';
      }
    });
  }

  // =====================================================
  // PROVINCE CHANGE
  // =====================================================

  onProvinceChange(provinceId: number | null): void {
    // Reset dependent fields

    this.profileForm.patchValue({
      districtId: null,

      localLevelId: null,

      wardNo: null
    });

    // Clear dependent dropdowns

    this.districts = [];

    this.localLevels = [];

    this.wards = [];

    if (provinceId === null) {
      return;
    }

    this.setDistricts(provinceId);
  }

  // =====================================================
  // SET DISTRICTS
  // =====================================================

  private setDistricts(provinceId: number): void {
    /*
     * Find selected province using ID.
     */

    const selectedProvince = this.provinces.find((province) => province.id === provinceId);

    if (!selectedProvince) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Province ID is used by the form/backend.
     *
     * provinceCode is used for
     * filtering locations.
     */

    this.districts = this.locations

      .filter((location) => location.provinceCode === selectedProvince.provinceCode)

      // Remove duplicate districts
      .filter(
        (location, index, self) => index === self.findIndex((item) => item.districtCode === location.districtCode)
      );
  }

  // =====================================================
  // DISTRICT CHANGE
  // =====================================================

  onDistrictChange(districtId: number | null): void {
    // Reset dependent fields

    this.profileForm.patchValue({
      localLevelId: null,

      wardNo: null
    });

    this.localLevels = [];

    this.wards = [];

    if (districtId === null) {
      return;
    }

    this.setLocalLevels(districtId);
  }

  // =====================================================
  // SET LOCAL LEVELS
  // =====================================================

  private setLocalLevels(districtId: number): void {
    /*
     * Find selected district
     * using district ID.
     */

    const selectedDistrict = this.districts.find((district) => district.id === districtId);

    if (!selectedDistrict) {
      return;
    }

    /*
     * Filter locations using:
     *
     * provinceCode
     * +
     * districtCode
     */

    this.localLevels = this.locations

      .filter(
        (location) =>
          location.provinceCode === selectedDistrict.provinceCode &&
          location.districtCode === selectedDistrict.districtCode
      )

      // Remove duplicate local levels
      .filter(
        (location, index, self) => index === self.findIndex((item) => item.localLevelCode === location.localLevelCode)
      );
  }

  // =====================================================
  // LOCAL LEVEL CHANGE
  // =====================================================

  onLocalLevelChange(localLevelId: number | null): void {
    // Reset ward

    this.profileForm.patchValue({
      wardNo: null
    });

    this.wards = [];

    if (localLevelId === null) {
      return;
    }

    this.setWards(localLevelId);
  }

  // =====================================================
  // SET WARDS
  // =====================================================

  private setWards(localLevelId: number): void {
    /*
     * Find local level using ID.
     */

    const selectedLocalLevel = this.localLevels.find((localLevel) => localLevel.id === localLevelId);

    if (!selectedLocalLevel) {
      return;
    }

    /*
     * totalWard determines
     * how many ward options exist.
     */

    this.wards = Array.from(
      {
        length: selectedLocalLevel.totalWard
      },
      (_, index) => index + 1
    );
  }

  // =====================================================
  // BUILD PATCH PAYLOAD (CHANGED FIELDS ONLY)
  // =====================================================

  /**
   * Walks every control in profileForm and returns
   * an object containing only the controls that are
   * "dirty" - i.e. the user actually touched/changed
   * them since the form was populated.
   *
   * This is what gets sent to the PATCH endpoint,
   * so we never send the whole profile back when
   * only one or two fields actually changed.
   */
  private getChangedFields(): Partial<CoopProfile> {
    const changedFields: Partial<CoopProfile> = {};

    const rawValue = this.profileForm.getRawValue();

    Object.keys(this.profileForm.controls).forEach((key) => {
      const controlKey = key as keyof CoopProfile;

      const control = this.profileForm.get(controlKey);

      if (control?.dirty) {
        (changedFields as any)[controlKey] = rawValue[controlKey];
      }
    });

    return changedFields;
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {
    this.successMessage = '';

    this.errorMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    // ---------------------------------------------
    // EDIT MODE -> PATCH only the changed fields
    // ---------------------------------------------

    if (this.isEditMode) {
      const changedFields = this.getChangedFields();

      /*
       * Nothing was actually changed -
       * no need to call the API at all.
       */

      if (Object.keys(changedFields).length === 0) {
        this.isSubmitting = false;

        this.successMessage = 'No changes to save.';

        return;
      }

      this.coopProfileService.updateProfile(changedFields).subscribe({
        next: (response) => {
          this.isSubmitting = false;

          this.successMessage = 'Cooperative profile updated successfully.';

          /*
           * Form is clean again until the
           * user changes something else.
           */

          this.profileForm.markAsPristine();
        },

        error: (error) => {
          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.error?.defaultUserMessage ||
            'Unable to update profile. Please try again.';
        }
      });

      return;
    }

    // ---------------------------------------------
    // CREATE MODE -> POST the full profile
    // ---------------------------------------------

    const profileData: CoopProfile = this.profileForm.getRawValue();

    this.coopProfileService.createProfile(profileData).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        this.successMessage = 'Cooperative profile created successfully.';

        /*
         * A profile now exists -
         * future saves must PATCH.
         */

        this.isEditMode = true;

        this.profileForm.markAsPristine();
      },

      error: (error) => {
        this.isSubmitting = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          error?.error?.defaultUserMessage ||
          'Unable to create profile. Please try again.';
      }
    });
  }
}
