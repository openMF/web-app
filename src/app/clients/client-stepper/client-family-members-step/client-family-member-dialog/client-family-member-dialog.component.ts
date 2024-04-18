/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Client Family Members Dialog
 */
@Component({
  selector: 'mifosx-client-family-member-dialog',
  templateUrl: './client-family-member-dialog.component.html',
  styleUrls: ['./client-family-member-dialog.component.scss']
})
export class ClientFamilyMemberDialogComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
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
  constructor(public dialogRef: MatDialogRef<ClientFamilyMemberDialogComponent>,
              private formBuilder: UntypedFormBuilder,
              private dateUtils: Dates,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.createFamilyMemberForm();
    if (this.data.context === 'Edit') {
      this.familyMemberForm.patchValue({
        'firstName': this.data.member.firstName,
        'middleName': this.data.member.middleName,
        'lastName': this.data.member.lastName,
        'qualification': this.data.member.qualification,
        'age': this.data.member.age,
        'isDependent': this.data.member.isDependent,
        'relationshipId': this.data.member.relationshipId,
        'genderId': this.data.member.genderId,
        'professionId': this.data.member.professionId,
        'maritalStatusId': this.data.member.maritalStatusId,
        'dateOfBirth': this.data.member.dateOfBirth && new Date(this.data.member.dateOfBirth)
      });
    }
  }

  /**
   * Creates Family Member Form
   */
  createFamilyMemberForm() {
    this.familyMemberForm = this.formBuilder.group({
      'firstName': ['', Validators.required],
      'middleName': [''],
      'lastName': ['', Validators.required],
      'qualification': [''],
      'age': [''],
      'isDependent': [''],
      'relationshipId': ['', Validators.required],
      'genderId': [''],
      'professionId': [''],
      'maritalStatusId': [''],
      'dateOfBirth': ['']
    });
  }

  /**
   * Returns Formatted Family Member
   */
  get familyMember() {
    const familyMemberFormData = this.familyMemberForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (familyMemberFormData.dateOfBirth instanceof Date) {
      familyMemberFormData.dateOfBirth = this.dateUtils.formatDate(familyMemberFormData.dateOfBirth, dateFormat);
    }
    const familyMember = {
      ...familyMemberFormData,
      dateFormat,
      locale
    };
    for (const key in familyMember) {
      if (familyMember[key] === '' || familyMember[key] === undefined) {
        delete familyMember[key];
      }
    }
    return familyMember;
  }

}
