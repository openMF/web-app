/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef , ViewChild,
         AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { UsersService } from '../users.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Validators */
import { confirmPasswordValidator } from '../../login/reset-password/confirm-password.validator';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';

/**
 * Create user component.
 */
@Component({
  selector: 'mifosx-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
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

  /* Reference of create user form */
  @ViewChild('userFormRef') userFormRef: ElementRef<any>;
  /* Template for popover on create user form */
  @ViewChild('templateUserFormRef') templateUserFormRef: TemplateRef<any>;

  /**
   * Retrieves the offices and roles data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersService} UsersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private usersService: UsersService,
              private route: ActivatedRoute,
              private router: Router,
              private popoverService: PopoverService,
              private configurationWizardService: ConfigurationWizardService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: {
        usersTemplate: any
      }) => {
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
  createUserForm() {
    this.userForm = this.formBuilder.group({
      'username': ['', Validators.required],
      'email': ['', [Validators.required, Validators.email]],
      'firstname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'lastname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'sendPasswordToEmail': [true],
      'passwordNeverExpires': [false],
      'officeId': ['', Validators.required],
      'staffId': [''],
      'roles': ['', Validators.required]
    }, { validator: confirmPasswordValidator });
  }

  /**
   * Sets the staff data each time the user selects a new office
   */
  setStaffData() {
    this.userForm.get('officeId').valueChanges.subscribe((officeId: string) => {
      this.staffData = [];
      this.usersService.getStaff(officeId).subscribe((staff: any) => {
        this.staffData = staff;
      });
    });
  }

  /**
   * Sets the conditional controls of the user form
   */
  setConditionalControls() {
    this.userForm.get('sendPasswordToEmail').valueChanges.subscribe((sendPasswordToEmail: boolean) => {
      if (sendPasswordToEmail) {
        this.userForm.removeControl('password');
        this.userForm.removeControl('repeatPassword');
        this.userForm.get('email').setValidators([Validators.required, Validators.email]);
      } else {
        this.userForm.addControl('password', new UntypedFormControl('', Validators.required));
        this.userForm.addControl('repeatPassword', new UntypedFormControl('', Validators.required));
        this.userForm.get('email').setValidators([Validators.email]);
      }
      this.userForm.get('email').updateValueAndValidity();
    });
  }

  /**
   * Submits the user form and creates user,
   * if successful redirects to view created user.
   */
  submit() {
    const user = this.userForm.value;
    if (this.userForm.value.staffId == null || this.userForm.value.staffId === '') {
      delete user.staffId;
    }
    this.usersService.createUser(user).subscribe((response: any) => {
      if (this.configurationWizardService.showUsersForm === true) {
        this.configurationWizardService.showUsersForm = false;
        this.openDialog();
      } else {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
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
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
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
    this.router.navigate(['/users']);
  }

  /**
   * Opens dialog if the user wants to create more users.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'user'
      },
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
