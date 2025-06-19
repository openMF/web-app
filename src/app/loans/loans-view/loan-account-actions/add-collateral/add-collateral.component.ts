/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Add Collateral component.
 */
@Component({
  selector: 'mifosx-add-collateral',
  templateUrl: './add-collateral.component.html',
  styleUrls: ['./add-collateral.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatInput,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class AddCollateralComponent implements OnInit {
  @Input() dataObject: any;

  /** Collateral form. */
  collateralForm: UntypedFormGroup;
  /** Loan Id. */
  loanId: string;

  /**
   * Retrieve data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Router} router Router.
   * @param {ActivatedRoute} route Activated Route.
   * @param {LoansService} LoansService loans service.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loanService: LoansService
  ) {}

  ngOnInit() {
    this.createAddCollateralForm();
  }

  /**
   * Set Collateral form.
   */
  createAddCollateralForm() {
    this.collateralForm = this.formBuilder.group({
      collateralTypeId: [
        '',
        Validators.required
      ],
      value: [
        '',
        Validators.required
      ],
      description: ['']
    });
  }

  /**
   * Submits collateral form.
   */
  submit() {
    const collateralTypeId = this.collateralForm.value.collateralTypeId;
    this.collateralForm.patchValue({
      collateralTypeId: collateralTypeId
    });
    const loanId = this.route.snapshot.params['loanId'];
    const collateralForm = this.collateralForm.value;
    collateralForm.locale = 'en';
    this.loanService.createLoanCollateral(loanId, collateralForm).subscribe((response: any) => {
      this.router.navigate(['../../loan-collateral'], { relativeTo: this.route });
    });
  }
}
