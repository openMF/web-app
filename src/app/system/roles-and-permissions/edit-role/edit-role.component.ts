/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RolesService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Service Zitadel */
import { environment } from '../../../../environments/environment';
import { AuthService } from 'app/zitadel/auth.service';

/**
 * Edit Role Description Component.
 */
@Component({
  selector: 'mifosx-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditRoleComponent implements OnInit {
  /** Role Form */
  roleForm: UntypedFormGroup;
  /** Role Data */
  roleData: any;

  /**
   * Retrieves the code data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {RolesService} rolesService Roles Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
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
    // Patch form with latest roleData if available
    if (this.roleData) {
      this.roleForm.patchValue({
        name: this.roleData.name,
        description: this.roleData.description
      });
      console.log('ngOnInit roleData:', this.roleData);
    } else {
      console.warn('ngOnInit: roleData is missing');
    }
  }

  /**
   * Creates and sets role form.
   */
  createRoleForm() {
    this.roleForm = this.formBuilder.group({
      name: [
        this.roleData.name,
        Validators.required
      ],
      description: [
        this.roleData.description,
        Validators.required
      ]
    });
  }

  /**
   * Submits the role form and updates role description,
   * if successful redirects to view updated roles and permissions.
   */
  submit() {
    // Debug log for troubleshooting
    console.log('submit roleData:', this.roleData);
    console.log('submit paramMap:', this.route.snapshot.paramMap);
    let roleId = this.roleData?.id;
    if (!roleId) {
      const paramId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('roleId');
      roleId = paramId ? Number(paramId) : undefined;
    }
    console.log('submit resolved roleId:', roleId);
    if (!roleId || isNaN(roleId)) {
      alert('Role ID is missing or invalid. Cannot update role.');
      console.error('Role ID is missing or invalid. Cannot update role.');
      return;
    }
    const updatePayload = {
      ...this.roleForm.value,
      id: roleId
    };
    console.log('submit updatePayload:', updatePayload);
    this.rolesService.updateRole({ roleId, putRolesRoleIdRequest: updatePayload }).subscribe({
      next: () => {
        if (environment.OIDC.oidcServerEnabled) {
          this.authService.updateRole(roleId, this.roleForm.get('name')?.value, this.roleForm.value.description);
        }
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => {
        alert('Failed to update role. Please try again.');
        console.error('Update role error:', err);
      }
    });
  }
}
