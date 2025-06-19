import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-create-fund',
  templateUrl: './create-fund.component.html',
  styleUrls: ['./create-fund.component.scss'],
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
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CreateFundComponent implements OnInit {
  /** Charge form. */
  fundForm: UntypedFormGroup;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} productsService Products Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private organizationService: OrganizationService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.createFundForm();
  }

  /**
   * Edit Fund form.
   */
  createFundForm() {
    this.fundForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      externalId: ['']
    });
  }

  submit() {
    const payload = this.fundForm.getRawValue();
    this.organizationService.createFund(payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
