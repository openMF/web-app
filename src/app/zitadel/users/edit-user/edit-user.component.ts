/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { UsersServiceZitadel } from '../usersZitadel.service';
import { UsersService } from 'app/users/users.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { COUNTRY_CODES } from 'app/zitadel/constants/coutry-codes';
import { ZITADEL_LANGUAGES } from 'app/zitadel/constants/languages';
/**
 * Edit User Component.
 */
@Component({
  selector: 'mifosx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditUserComponent implements OnInit {
  /** User Data */
  userData: any;
  /** Offices Data */
  officesData: any;
  /** Staff Data */
  staffData: any;
  /** Roles Data */
  rolesData: any;
  /** Edit User form. */
  editUserForm: UntypedFormGroup;
  /** Country Codes */
  countryCodes = COUNTRY_CODES;
  /** Language Codes */
  languageCodes = ZITADEL_LANGUAGES;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersServiceZitadel} UsersServiceZitadel Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {UsersService} UsersService Users Service.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private UsersServiceZitadel: UsersServiceZitadel,
    private UsersService: UsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { user: any; usersTemplate: any }) => {
      const fullUserData = data.user;
      this.userData = fullUserData.object?.result?.[0] || {};
      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;
      this.UsersServiceZitadel.getExtraUserData(this.userData.id).subscribe((resp: any) => {
        const data = resp.object;
        this.userData = {
          ...this.userData,
          userName: data.username_zitadel,
          officeId: data.office_id,
          staffId: data.staff_id,
          selectedRoles: data.roles || []
        };
        this.createEditUserForm();
        this.officeChanged(this.userData.officeId);
        this.UsersServiceZitadel.getRoles().subscribe((response: any) => {
          const rolesZitadel = response.object?.result || [];
          this.rolesData = rolesZitadel.map((r: any) => ({
            id: r.key,
            name: r.displayName
          }));
        });
      });
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  createEditUserForm() {
    const profile = this.userData?.human?.profile ?? {};
    const email = this.userData?.human?.email?.email || '';
    const phone = this.userData?.human?.phone?.phone || '';
    const defaultCode = '+1';
    let countryCode = defaultCode;
    let phoneNumber = phone;
    const gender = profile?.gender && profile.gender !== '' ? profile.gender : 'GENDER_MALE';
    const preferredLanguage = profile.preferredLanguage || 'es';

    for (const c of this.countryCodes) {
      if (phone.startsWith(c.code)) {
        countryCode = c.code;
        phoneNumber = phone.replace(c.code, '');
        break;
      }
    }

    this.editUserForm = this.formBuilder.group({
      username: [
        this.userData.userName,
        Validators.required
      ],
      email: [
        email,
        [
          Validators.required,
          Validators.email
        ]
      ],
      firstname: [
        profile.firstName || '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      lastname: [
        profile.lastName || '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      countryCode: [
        countryCode,
        Validators.required
      ],
      phoneNumber: [
        phoneNumber,
        Validators.required
      ],
      gender: [
        gender,
        Validators.required
      ],
      preferredLanguage: [
        preferredLanguage,
        Validators.required
      ],
      officeId: [
        this.userData.officeId,
        Validators.required
      ],
      staffId: [
        this.userData.staffId || null
      ],
      roles: [
        this.userData.selectedRoles.map((role: any) => role.id.toString()),
        Validators.required
      ]
    });
  }

  /**
   * Fetches the staff for the selected office
   * @param officeId the selected office id
   */
  officeChanged(officeId: number | undefined) {
    if (!officeId) {
      console.warn('No officeId provided to load staff.');
      return;
    }

    this.staffData = [];
    this.UsersService.getStaff(officeId).subscribe((staff: any) => {
      this.staffData = staff;
    });
  }

  /**
   * Submits the user form and edits the user,
   * if successful redirects to the updated user.
   */
  submit() {
    const form = this.editUserForm.value;
    const fullPhone = `${form.countryCode}${form.phoneNumber}`;

    const userPayload: any = {
      userId: this.userData.id,
      email: {
        email: form.email,
        isVerified: true
      },
      phone: {
        phone: fullPhone,
        isVerified: true
      },
      profile: {
        username: form.username,
        givenName: form.firstname,
        familyName: form.lastname,
        displayName: `${form.firstname} ${form.lastname}`,
        nickName: form.firstname,
        preferredLanguage: form.preferredLanguage,
        gender: form.gender
      }
    };

    const rolesPayload = {
      userId: this.userData.id,
      roleKeys: this.editUserForm.value.roles
    };

    const officePayload = {
      userId: this.userData.id,
      officeId: form.officeId,
      staffId: form.staffId
    };

    this.UsersServiceZitadel.editUser(userPayload).subscribe();

    this.UsersServiceZitadel.editRoles(rolesPayload).subscribe();

    this.UsersServiceZitadel.editOffice(officePayload).subscribe((response: any) => {
      this.router.navigate(['/appusers']);
    });
  }
}
