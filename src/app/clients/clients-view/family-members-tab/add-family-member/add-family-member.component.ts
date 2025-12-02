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
 * Add Family Member Component
 */
@Component({
  selector: 'mifosx-add-family-member',
  templateUrl: './add-family-member.component.html',
  styleUrls: ['./add-family-member.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class AddFamilyMemberComponent implements OnInit {
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Minimum age allowed is 0. */
  minAge = 0;
  /** Add family member form. */
  addFamilyMemberForm: UntypedFormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  /** Client ID */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder FormBuilder
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {Route} route Route
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
    this.route.data.subscribe((data: { clientTemplate: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
    });
    this.clientId = this.route.parent.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createAddFamilyMemberForm();
    this.addFamilyMemberForm.get('dateOfBirth').valueChanges.subscribe((dateOfBirth: any) => {
      if (dateOfBirth) {
        const age = this.calculateAge(dateOfBirth);
        this.addFamilyMemberForm.get('age').setValue(age);
      } else {
        this.addFamilyMemberForm.get('age').setValue('');
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
   * Creates the add family member form
   */
  createAddFamilyMemberForm() {
    this.addFamilyMemberForm = this.formBuilder.group({
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
   * Submits the form and adds the family member
   */
  submit() {
    // Get form values including disabled controls like age
    const formValue = {
      ...this.addFamilyMemberForm.getRawValue()
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

    this.clientsService.addFamilyMember(this.clientId, data).subscribe((res) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
