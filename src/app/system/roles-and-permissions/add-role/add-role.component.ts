/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Add Role Component.
 */
@Component({
  selector: 'mifosx-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    NgIf,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    NgxTranslatePipe
  ]
})
export class AddRoleComponent implements OnInit {
  /** Role form. */
  roleForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
