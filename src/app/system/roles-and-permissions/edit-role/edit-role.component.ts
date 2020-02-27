/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Edit Role Description Component.
 */
@Component({
  selector: 'mifosx-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
})
export class EditRoleComponent implements OnInit {
  /** Role Form */
  roleForm: FormGroup;
  /** Role Data */
  roleData: any;

  /**
   * Retrieves the code data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: FormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { role: any }) => {
      this.roleData = data.role;
    });
  }

  /**
   * Creates and sets the role form.
   */
  ngOnInit() {
    this.createRoleForm();
  }

  /**
   * Creates and sets role form.
   */
  createRoleForm() {
    this.roleForm = this.formBuilder.group({
      name: [{ value: this.roleData.name, disabled: true }, Validators.required],
      description: [this.roleData.description, Validators.required],
    });
  }

  /**
   * Submits the role form and updates role description,
   * if successful redirects to view updated roles and permissions.
   */
  submit() {
    this.systemService.updateRole(this.roleForm.value, this.roleData.id).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
