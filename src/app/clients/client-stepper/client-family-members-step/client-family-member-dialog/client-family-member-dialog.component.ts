/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

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
  familyMemberForm: FormGroup;

  /**
   * @param {MatDialogRef} dialogRef Client Family Member Dialog Reference
   * @param {FormBuilder} formBuilder Form Builder
   * @param {DatePipe} datePipe Date Pipe
   * @param {any} data Dialog Data
   */
  constructor(public dialogRef: MatDialogRef<ClientFamilyMemberDialogComponent>,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

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
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    // TODO: Update once language and date settings are setup
    const familyMember = {
      ...this.familyMemberForm.value,
      dateFormat,
      locale
    };
    for (const key in familyMember) {
      if (familyMember[key] === '' || familyMember[key] === undefined) {
        delete familyMember[key];
      }
    }
    if (familyMember.dateOfBirth) {
      familyMember.dateOfBirth = this.datePipe.transform(familyMember.dateOfBirth, dateFormat);
    }
    return familyMember;
  }

}
