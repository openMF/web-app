/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Create Payment Type Component.
 */
@Component({
  selector: 'mifosx-create-payment-type',
  templateUrl: './create-payment-type.component.html',
  styleUrls: ['./create-payment-type.component.scss']
})
export class CreatePaymentTypeComponent implements OnInit {

  /** Payment Type form. */
  paymentTypeForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private router: Router,
              private route: ActivatedRoute) {}

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
      'name': ['', Validators.required],
      'description': [''],
      'isCashPayment': [false],
      'position': ['', Validators.required],
    });
  }

  /**
   * Submits the payment type form and creates payment type.
   * if successful redirects to payment types
   */
  submit() {
    const paymentType = this.paymentTypeForm.value;
    this.organizationService.createPaymentType(paymentType).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
