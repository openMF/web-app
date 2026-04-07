/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
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
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Payment Type form. */
  paymentTypeForm: UntypedFormGroup;

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
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  /**
   * Submits the payment type form and creates payment type.
   * if successful redirects to payment types
   */
  submit() {
    const paymentType = this.paymentTypeForm.value;
    this.organizationService.createPaymentType(paymentType).subscribe((response) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
