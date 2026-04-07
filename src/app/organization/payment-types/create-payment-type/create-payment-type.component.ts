/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { PaymentTypeService } from '@fineract/client';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Payment Type Component.
 */
@Component({
  selector: 'mifosx-create-payment-type',
  templateUrl: './create-payment-type.component.html',
  styleUrls: ['./create-payment-type.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    MatCheckbox
  ]
})
export class CreatePaymentTypeComponent implements OnInit {
  /** Payment Type form. */
  paymentTypeForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {PaymentTypeService} paymentTypeService Payment Type Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private paymentTypeService: PaymentTypeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Creates and sets the payment type form.
   */
  ngOnInit() {
    this.createpaymentTypeForm();
  }

  /**
   * Creates the payment type form.
   */
  createpaymentTypeForm() {
    this.paymentTypeForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      description: [''],
      isCashPayment: [false],
      position: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the payment type form and creates payment type.
   * if successful redirects to payment types
   */
  submit() {
    const paymentType = this.paymentTypeForm.value;
    this.paymentTypeService.createPaymentType(paymentType).subscribe((response) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
