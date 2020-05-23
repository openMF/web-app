/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { UsersService } from '../users.service';

/**
 * Edit User Component.
 */
@Component({
    selector: 'mifosx-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.scss']
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
  editUserForm: FormGroup;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {UsersService} UsersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private usersService: UsersService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { user: any, usersTemplate: any }) => {
      this.userData = data.user;
      this.officesData = data.usersTemplate.allowedOffices;
      this.rolesData = data.usersTemplate.availableRoles;
    });
  }

  ngOnInit() {
    this.createEditUserForm();
    this.officeChanged(this.userData.officeId);
  }

  /**
   * Creates the edit user form.
   */
  createEditUserForm() {
    const staffId = this.userData.staff ? this.userData.staff.id : null;
    this.editUserForm = this.formBuilder.group({
      'username': [this.userData.username, Validators.required],
      'email': [this.userData.email, [Validators.required, Validators.email]],
      'firstname': [this.userData.firstname, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'lastname': [this.userData.lastname, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'passwordNeverExpires': [this.userData.passwordNeverExpires],
      'officeId': [this.userData.officeId, Validators.required],
      'staffId': [staffId],
      'roles': [this.userData.selectedRoles.map((role: any) => role.id), Validators.required]
    });
  }

  /**
   * Fetches the staff for the selected office
   * @param officeId the selected office id
   */
  officeChanged(officeId: number) {
    this.staffData = [];
    this.usersService.getStaff(officeId).subscribe((staff: any) => {
      this.staffData = staff;
    });
  }

  /**
   * Submits the user form and edits the user,
   * if successful redirects to the updated user.
   */
  submit() {
    const editedUser = this.editUserForm.value;
    this.usersService.editUser(this.userData.id, editedUser).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
