/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Service Zitadel */
import { environment } from '../../../../environments/environment';
import { AuthService } from 'app/zitadel/auth.service';

/**
 * Add Role Component.
 */
@Component({
  selector: 'mifosx-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class AddRoleComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private systemService = inject(SystemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  /** Role form. */
  roleForm: UntypedFormGroup;

  /**
   * Creates the role form.
   */
  ngOnInit() {
    this.createRoleForm();
  }

  /**
   * Creates the create role form.
   */
  createRoleForm() {
    this.roleForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      description: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the role form and creates a role,
   * if successful redirects back to roles and permission.
   */
  submit() {
    this.systemService.createRole(this.roleForm.value).subscribe((response: any) => {
      if (environment.OIDC.oidcServerEnabled) {
        this.authService.createRole(response.resourceId, this.roleForm.value.name, this.roleForm.value.description);
      }
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
