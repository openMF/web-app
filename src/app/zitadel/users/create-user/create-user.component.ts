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
import { COUNTRY_CODES } from 'app/zitadel/constants/coutry-codes';
import { ZITADEL_LANGUAGES } from 'app/zitadel/constants/languages';

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
  /** Country Codes */
  countryCodes = COUNTRY_CODES;
  /** Language Codes */
  languageCodes = ZITADEL_LANGUAGES;

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
        const body = {
          id: userId,
          officeId: dataOffi.officeId,
          staffId: dataOffi.staffId,
          username: user.nickName,
          firstname: user.givenName,
          lastname: user.familyName,
          roleIds: selectedRoleIds || []
        };

        this.usersService.createUserBd(body).subscribe(
          (response: any) => {
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
                  console.error('Failed to assign roles to user:', error);
                }
              );
            } else {
              console.warn('No roles were selected for this user.');
            }
          },
          (error) => {
            console.error('Failed to create user record in database:', error);
          }
        );
      } else {
        console.error('User creation failed: userId not returned by API.');
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
