/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Edit Code Component.
 */
@Component({
  selector: 'mifosx-edit-code',
  templateUrl: './edit-code.component.html',
  styleUrls: ['./edit-code.component.scss'],
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
    HasPermissionDirective,
    NgxTranslatePipe
  ]
})
export class EditCodeComponent implements OnInit {
  /** Code Form */
  codeForm: UntypedFormGroup;
  /** Code Data */
  codeData: any;

  /**
   * Retrieves the code data from `resolve`.
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
  ) {
    this.route.data.subscribe((data: { code: any }) => {
      this.codeData = data.code;
    });
  }

  /**
   * Creates and sets the code form.
   */
  ngOnInit() {
    this.createCodeForm();
  }

  /**
   * Creates and sets code form.
   */
  createCodeForm() {
    this.codeForm = this.formBuilder.group({
      name: [
        this.codeData.name,
        Validators.required
      ]
    });
  }

  /**
   * Submits the code form and updates code,
   * if successful redirects to view updated code.
   */
  submit() {
    this.systemService.updateCode(this.codeForm.value, this.codeData.id).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
