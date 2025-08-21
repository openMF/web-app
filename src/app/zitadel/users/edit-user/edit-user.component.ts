/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { UsersServiceZitadel } from '../usersZitadel.service';
import { UsersService } from 'app/users/users.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
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
      this.UsersServiceZitadel.getDatosExtraUsuario(this.userData.id).subscribe((resp: any) => {
        const datos = resp.object;
        console.table(datos);

        this.userData = {
          ...this.userData,
          userName: datos.username_zitadel,
          officeId: datos.office_id,
          staffId: datos.staff_id,
          selectedRoles: datos.roles || []
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

  countryCodes = [
    { code: '+93', key: 'AF' },
    { code: '+355', key: 'AL' },
    { code: '+213', key: 'DZ' },
    { code: '+376', key: 'AD' },
    { code: '+244', key: 'AO' },
    { code: '+54', key: 'AR' },
    { code: '+374', key: 'AM' },
    { code: '+61', key: 'AU' },
    { code: '+43', key: 'AT' },
    { code: '+994', key: 'AZ' },
    { code: '+973', key: 'BH' },
    { code: '+880', key: 'BD' },
    { code: '+375', key: 'BY' },
    { code: '+32', key: 'BE' },
    { code: '+591', key: 'BO' },
    { code: '+387', key: 'BA' },
    { code: '+55', key: 'BR' },
    { code: '+359', key: 'BG' },
    { code: '+226', key: 'BF' },
    { code: '+257', key: 'BI' },
    { code: '+855', key: 'KH' },
    { code: '+237', key: 'CM' },
    { code: '+1', key: 'CA' },
    { code: '+56', key: 'CL' },
    { code: '+86', key: 'CN' },
    { code: '+57', key: 'CO' },
    { code: '+506', key: 'CR' },
    { code: '+385', key: 'HR' },
    { code: '+53', key: 'CU' },
    { code: '+357', key: 'CY' },
    { code: '+420', key: 'CZ' },
    { code: '+45', key: 'DK' },
    { code: '+20', key: 'EG' },
    { code: '+503', key: 'SV' },
    { code: '+34', key: 'ES' },
    { code: '+372', key: 'EE' },
    { code: '+251', key: 'ET' },
    { code: '+358', key: 'FI' },
    { code: '+33', key: 'FR' },
    { code: '+995', key: 'GE' },
    { code: '+49', key: 'DE' },
    { code: '+233', key: 'GH' },
    { code: '+30', key: 'GR' },
    { code: '+502', key: 'GT' },
    { code: '+504', key: 'HN' },
    { code: '+36', key: 'HU' },
    { code: '+354', key: 'IS' },
    { code: '+91', key: 'IN' },
    { code: '+62', key: 'ID' },
    { code: '+964', key: 'IQ' },
    { code: '+98', key: 'IR' },
    { code: '+353', key: 'IE' },
    { code: '+972', key: 'IL' },
    { code: '+39', key: 'IT' },
    { code: '+81', key: 'JP' },
    { code: '+962', key: 'JO' },
    { code: '+7', key: 'KZ' },
    { code: '+254', key: 'KE' },
    { code: '+965', key: 'KW' },
    { code: '+996', key: 'KG' },
    { code: '+371', key: 'LV' },
    { code: '+961', key: 'LB' },
    { code: '+218', key: 'LY' },
    { code: '+370', key: 'LT' },
    { code: '+352', key: 'LU' },
    { code: '+389', key: 'MK' },
    { code: '+60', key: 'MY' },
    { code: '+52', key: 'MX' },
    { code: '+373', key: 'MD' },
    { code: '+377', key: 'MC' },
    { code: '+976', key: 'MN' },
    { code: '+212', key: 'MA' },
    { code: '+258', key: 'MZ' },
    { code: '+977', key: 'NP' },
    { code: '+31', key: 'NL' },
    { code: '+64', key: 'NZ' },
    { code: '+505', key: 'NI' },
    { code: '+234', key: 'NG' },
    { code: '+47', key: 'NO' },
    { code: '+92', key: 'PK' },
    { code: '+507', key: 'PA' },
    { code: '+595', key: 'PY' },
    { code: '+51', key: 'PE' },
    { code: '+63', key: 'PH' },
    { code: '+48', key: 'PL' },
    { code: '+351', key: 'PT' },
    { code: '+974', key: 'QA' },
    { code: '+40', key: 'RO' },
    { code: '+7', key: 'RU' },
    { code: '+966', key: 'SA' },
    { code: '+221', key: 'SN' },
    { code: '+381', key: 'RS' },
    { code: '+65', key: 'SG' },
    { code: '+421', key: 'SK' },
    { code: '+386', key: 'SI' },
    { code: '+27', key: 'ZA' },
    { code: '+82', key: 'KR' },
    { code: '+94', key: 'LK' },
    { code: '+46', key: 'SE' },
    { code: '+41', key: 'CH' },
    { code: '+886', key: 'TW' },
    { code: '+66', key: 'TH' },
    { code: '+90', key: 'TR' },
    { code: '+256', key: 'UG' },
    { code: '+380', key: 'UA' },
    { code: '+971', key: 'AE' },
    { code: '+44', key: 'GB' },
    { code: '+1', key: 'US' },
    { code: '+598', key: 'UY' },
    { code: '+998', key: 'UZ' },
    { code: '+58', key: 'VE' },
    { code: '+84', key: 'VN' },
    { code: '+967', key: 'YE' },
    { code: '+260', key: 'ZM' },
    { code: '+263', key: 'ZW' }
  ];

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
