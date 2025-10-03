/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatDialogClose
  ]
})
export class ClientFamilyMemberDialogComponent implements OnInit {
  /** Maximum Due Date allowed. */
  maxDate = new Date();

  /** Add/Edit family member form. */
  familyMemberForm: UntypedFormGroup;

  /**
   * @param {MatDialogRef} dialogRef Client Family Member Dialog Reference
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {any} data Dialog Data
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    public dialogRef: MatDialogRef<ClientFamilyMemberDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingsService: SettingsService
  ) {}

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
    this.familyMemberForm.get('dateOfBirth').valueChanges.subscribe((dateOfBirth: any) => {
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
        { value: '', disabled: true }],
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
