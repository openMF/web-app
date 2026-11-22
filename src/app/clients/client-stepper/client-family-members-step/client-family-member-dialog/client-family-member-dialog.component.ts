/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';

/**
 * Client Family Members Dialog
 */
@Component({
  selector: 'mifosx-client-family-member-dialog',
  templateUrl: './client-family-member-dialog.component.html',
  styleUrls: ['./client-family-member-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose,
    NepaliDateInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFamilyMemberDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ClientFamilyMemberDialogComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private dateUtils = inject(Dates);
  data = inject(MAT_DIALOG_DATA);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  /** Maximum Due Date allowed. */
  maxDate = new Date();

  /** Add/Edit family member form. */
  familyMemberForm: FormGroup;

  /**
   * The date of birth in Bikram Sambat, 'YYYY-MM-DD', as the picker reported it.
   *
   * It is posted as dateOfBirthBs so the server stores the date the user actually chose rather
   * than one the browser converted. It is held outside the form because the form control carries
   * the AD Date that the age calculation needs.
   */
  dateOfBirthBs: string | null = null;

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createFamilyMemberForm();
    if (this.data.context === 'Edit') {
      this.familyMemberForm.patchValue({
        firstName: this.data.member.firstName,
        middleName: this.data.member.middleName,
        lastName: this.data.member.lastName,
        qualification: this.data.member.qualification,
        age: this.data.member.age,
        isDependent: this.data.member.isDependent,
        relationshipId: this.data.member.relationshipId,
        genderId: this.data.member.genderId,
        professionId: this.data.member.professionId,
        maritalStatusId: this.data.member.maritalStatusId,
        dateOfBirth: this.data.member.dateOfBirth && new Date(this.data.member.dateOfBirth)
      });
    }

    // Add subscription to date of birth changes to update age
    this.familyMemberForm
      .get('dateOfBirth')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateOfBirth: any) => {
        if (dateOfBirth) {
          const age = this.calculateAge(dateOfBirth);
          this.familyMemberForm.get('age').setValue(age);
        } else {
          this.familyMemberForm.get('age').setValue('');
        }
      });

    // If a date of birth is already set, calculate the age
    const currentDob = this.familyMemberForm.get('dateOfBirth').value;
    if (currentDob) {
      const age = this.calculateAge(currentDob);
      this.familyMemberForm.get('age').setValue(age);
    }
  }

  /**
   * Calculates age from date of birth
   * @param {Date} dateOfBirth Date of Birth
   * @returns {number} Age
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date(this.settingsService.businessDate);
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Creates Family Member Form
   */
  createFamilyMemberForm() {
    this.familyMemberForm = this.formBuilder.group({
      firstName: [
        '',
        Validators.required
      ],
      middleName: [''],
      lastName: [
        '',
        Validators.required
      ],
      qualification: [''],
      age: [
        { value: '', disabled: true }
      ],
      isDependent: [''],
      relationshipId: [
        '',
        Validators.required
      ],
      genderId: [
        '',
        Validators.required
      ],
      professionId: [''],
      maritalStatusId: [''],
      dateOfBirth: ['']
    });
  }

  /**
   * Returns Formatted Family Member
   */
  /**
   * Closes with the family member, or, if a required field is empty, shows each field's error
   * and stays open so the user can fill it in.
   */
  confirm() {
    if (this.familyMemberForm.invalid) {
      this.familyMemberForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ member: this.familyMember });
  }

  get familyMember() {
    // Get form values including disabled controls like age
    const formValue = {
      ...this.familyMemberForm.getRawValue()
    };

    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevDateOfBirth: Date = formValue.dateOfBirth;

    // Calculate age from dateOfBirth if present
    if (prevDateOfBirth) {
      if (formValue.dateOfBirth instanceof Date) {
        formValue.dateOfBirth = this.dateUtils.formatDate(prevDateOfBirth, dateFormat);
      }
      // Ensure age is calculated even if it wasn't already
      if (!formValue.age && prevDateOfBirth) {
        formValue.age = this.calculateAge(prevDateOfBirth);
      }
    } else {
      // If no date of birth, remove age and dateOfBirth from submission
      delete formValue.age;
      delete formValue.dateOfBirth;
    }

    const familyMember = {
      ...formValue,
      ...(prevDateOfBirth && this.dateOfBirthBs ? { dateOfBirthBs: this.dateOfBirthBs } : {}),
      dateFormat,
      locale
    };

    // Remove empty fields
    for (const key in familyMember) {
      if (familyMember[key] === '' || familyMember[key] === undefined) {
        delete familyMember[key];
      }
    }

    return familyMember;
  }
}
