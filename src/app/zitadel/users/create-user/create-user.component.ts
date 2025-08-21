/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
//import { UsersService } from '../users.service';
import { UsersServiceZitadel } from '../usersZitadel.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';

/** Custom Dialog Component */
import { PasswordsUtility } from 'app/core/utils/passwords-utility';
import { confirmPasswordValidator } from 'app/login/reset-password/confirm-password.validator';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { ContinueSetupDialogComponent } from 'app/configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { UsersService } from 'app/users/users.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create user component.
 */
@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class CreateUserComponent implements OnInit, AfterViewInit {
  /** User form. */
  userForm: UntypedFormGroup;
  /** Offices data. */
  officesData: any;
  /** Roles data. */
  rolesData: any;
  /** Staff data. */
  staffData: any;

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

  /* Reference of create user form */
  @ViewChild('userFormRef') userFormRef: ElementRef<any>;
  /* Template for popover on create user form */
  @ViewChild('templateUserFormRef') templateUserFormRef: TemplateRef<any>;

  /**
   * Retrieves the offices and roles data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersServiceZitadel} UsersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private usersService: UsersServiceZitadel,
    private usersService2: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private popoverService: PopoverService,
    private configurationWizardService: ConfigurationWizardService,
    private dialog: MatDialog,
    private passwordsUtility: PasswordsUtility
  ) {
    this.route.data.subscribe((data: { usersTemplate: any }) => {
      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;
    });
  }

  /**
   * Creates the user form, sets the staff data and conditional controls of the user form.
   */
  ngOnInit() {
    this.createUserForm();
    this.setStaffData();
    this.setConditionalControls();
  }

  /**
   * Creates the user form.
   */
  createUserForm(): void {
    this.userForm = this.formBuilder.group(
      {
        username: [
          '',
          Validators.required
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        firstName: [
          '',
          Validators.required
        ],
        lastName: [
          '',
          Validators.required
        ],
        preferredLanguage: [
          '',
          Validators.required
        ],
        gender: [
          '',
          Validators.required
        ],
        countryCode: [
          '+1',
          Validators.required
        ],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{7,15}$/)]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(12),
            Validators.maxLength(50),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]
        ],
        repeatPassword: [
          '',
          Validators.required
        ],
        roles: [
          '',
          Validators.required
        ],
        officeId: [
          '',
          Validators.required
        ],
        staffId: ['']
      },
      { validators: confirmPasswordValidator }
    );

    /*
    this.userForm.get('repeatPassword')?.valueChanges.subscribe(() => {
      this.userForm.updateValueAndValidity();
    });

    this.userForm.statusChanges.subscribe((status) => {
      console.log('Form status:', status);
      console.log(
        'Invalid fields:',
        Object.entries(this.userForm.controls)
          .filter(
            ([
              _,
              control
            ]) => control.invalid
          )
          .map(([key]) => key)
      );
    });*/
  }

  /**
   * Sets the staff data each time the user selects a new office
   */
  setStaffData() {
    this.userForm.get('officeId').valueChanges.subscribe((officeId: string) => {
      this.staffData = [];
      this.usersService2.getStaff(officeId).subscribe((staff: any) => {
        this.staffData = staff;
      });
    });
  }

  /**
   * Sets the conditional controls of the user form
   */
  setConditionalControls() {
    this.userForm.get('sendPasswordToEmail').valueChanges.subscribe((sendPasswordToEmail: boolean) => {
      const passwordControl = this.userForm.get('password');
      const repeatPasswordControl = this.userForm.get('repeatPassword');

      if (sendPasswordToEmail) {
        passwordControl.disable();
        repeatPasswordControl.disable();
        this.userForm.get('email')?.setValidators([
          Validators.required,
          Validators.email
        ]);
      } else {
        passwordControl.enable();
        repeatPasswordControl.enable();
        this.userForm.get('email')?.setValidators([Validators.email]);
      }

      this.userForm.get('email')?.updateValueAndValidity();
    });
  }

  /**
   * Submits the user form and creates user,
   * if successful redirects to view created user.
   */
  submit() {
    const fullForm = this.userForm.value;

    const fullPhone = `${fullForm.countryCode}${fullForm.phoneNumber}`;
    const password = `${fullForm.repeatPassword}`;
    const givenName = `${fullForm.firstName}`;
    const familyName = `${fullForm.lastName}`;
    const nickName = `${fullForm.username}`;

    const user = {
      ...fullForm,
      phone: fullPhone,
      password: password,
      givenName: givenName,
      familyName: familyName,
      nickName: nickName,
      displayName: `${fullForm.firstName} ${fullForm.lastName}`
    };

    const dataOffi = {
      officeId: fullForm.officeId,
      staffId: fullForm.staffId
    };

    const selectedRoleIds = this.userForm.get('roles')?.value;

    delete user.officeId;
    delete user.staffId;
    delete user.roles;
    delete user.countryCode;
    delete user.phoneNumber;
    delete user.repeatPassword;
    delete user.firstName;
    delete user.lastName;

    this.usersService.createUser(user).subscribe((response: any) => {
      const userId = response.object?.userId;

      if (userId) {
        const bodyBD = {
          id: userId,
          officeId: dataOffi.officeId,
          staffId: dataOffi.staffId,
          username: user.nickName,
          firstname: user.givenName,
          lastname: user.familyName,
          roleIds: selectedRoleIds || []
        };

        //console.log('Sending to CrearBD:', bodyBD);

        this.usersService.createUserBd(bodyBD).subscribe(
          (resBD: any) => {
            //console.log('User created in DB:', resBD);

            if (selectedRoleIds?.length > 0) {
              this.usersService.assignRolesToUser(userId, selectedRoleIds).subscribe(
                () => {
                  if (this.configurationWizardService.showUsersForm === true) {
                    this.configurationWizardService.showUsersForm = false;
                    this.openDialog();
                  } else {
                    this.router.navigate(['/appusers']);
                  }
                },
                (error) => {
                  console.error('Error assigning roles:', error);
                }
              );
            } else {
              console.warn('No selected roles found.');
            }
          },
          (error) => {
            console.error('Error creating in DB (CrearBD):', error);
          }
        );
      } else {
        console.error('Could not get userId');
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showUsersForm === true) {
      setTimeout(() => {
        this.showPopover(this.templateUserFormRef, this.userFormRef.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Maker Checker Tasks System Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showUsersForm = false;
    this.configurationWizardService.showMakerCheckerTable = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Users page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showUsersForm = false;
    this.configurationWizardService.showUsersList = true;
    this.router.navigate(['/appusers']);
  }

  /**
   * Opens dialog if the user wants to create more users.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'user'
      }
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
        this.configurationWizardService.showUsersForm = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showUsersForm = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/users/create']);
      } else if (response.step === 3) {
        this.configurationWizardService.showUsersForm = false;
        this.configurationWizardService.showMakerCheckerTable = true;
        this.router.navigate(['/system']);
      }
    });
  }
}
