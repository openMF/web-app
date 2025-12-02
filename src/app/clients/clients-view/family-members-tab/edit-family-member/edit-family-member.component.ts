/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Family Member Component
 */
@Component({
  selector: 'mifosx-edit-family-member',
  templateUrl: './edit-family-member.component.html',
  styleUrls: ['./edit-family-member.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class EditFamilyMemberComponent implements OnInit {
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add family member form. */
  editFamilyMemberForm: UntypedFormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Family Members Details */
  familyMemberDetails: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {ActivatedRoute} route Route
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    private router: Router,
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { clientTemplate: any; editFamilyMember: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
      this.familyMemberDetails = data.editFamilyMember;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditFamilyMemberForm(this.familyMemberDetails);
    this.editFamilyMemberForm.get('dateOfBirth').valueChanges.subscribe((dateOfBirth: any) => {
      if (dateOfBirth) {
        const age = this.calculateAge(dateOfBirth);
        this.editFamilyMemberForm.get('age').setValue(age);
      } else {
        this.editFamilyMemberForm.get('age').setValue('');
      }
    });
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
   * Creates Edit Family Member Form
   * @param {any} familyMember Family Member
   */
  createEditFamilyMemberForm(familyMember: any) {
    this.editFamilyMemberForm = this.formBuilder.group({
      firstName: [
        familyMember.firstName,
        Validators.required
      ],
      middleName: [familyMember.middleName],
      lastName: [
        familyMember.lastName,
        Validators.required
      ],
      qualification: [familyMember.qualification],
      age: [
        { value: familyMember.age, disabled: true }],
      isDependent: [familyMember.isDependent],
      relationshipId: [
        familyMember.relationshipId,
        Validators.required
      ],
      genderId: [
        familyMember.genderId,
        Validators.required
      ],
      professionId: [familyMember.professionId],
      maritalStatusId: [familyMember.maritalStatusId],
      dateOfBirth: [
        familyMember.dateOfBirth ? this.dateUtils.formatDate(familyMember.dateOfBirth, 'yyyy-MM-dd') : null
      ]
    });
  }

  /**
   * Submits the form and updates the client family member.
   */
  submit() {
    // Get form values including disabled controls like age
    const formValue = {
      ...this.editFamilyMemberForm.getRawValue()
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

    const data = {
      ...formValue,
      dateFormat,
      locale
    };

    this.clientsService
      .editFamilyMember(this.familyMemberDetails.clientId, this.familyMemberDetails.id, data)
      .subscribe((res) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
