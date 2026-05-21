/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { amountValueValidator } from 'app/shared/validators/amount-value.validator';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Router } from '@angular/router';
import { Breach } from 'app/products/loan-products/models/loan-product.model';
import { InputPositiveIntegerComponent } from 'app/shared/input-positive-integer/input-positive-integer.component';

@Component({
  selector: 'mifosx-edit-breach-configuration',
  templateUrl: './edit-breach-configuration.component.html',
  styleUrl: './edit-breach-configuration.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputPositiveIntegerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);

  breachForm: UntypedFormGroup;

  breachData: Breach | null = null;
  breachFrequencyTypeOptions: StringEnumOptionData[] = [];
  breachAmountCalculationTypeOptions: StringEnumOptionData[] = [];

  ngOnInit(): void {
    this.route.data.subscribe((data: { breachData: Breach; breachTemplate: any }) => {
      this.breachData = data.breachData;
      this.breachFrequencyTypeOptions = data.breachTemplate.breachFrequencyTypeOptions || [];
      this.breachAmountCalculationTypeOptions = data.breachTemplate.breachAmountCalculationTypeOptions || [];
      this.initForm();
    });
  }

  private initForm(): void {
    this.breachForm = this.formBuilder.group({
      name: [
        this.breachData!.name,
        [
          Validators.required
        ]
      ],
      breachFrequency: [
        this.breachData!.breachFrequency,
        [
          Validators.required
        ]
      ],
      breachFrequencyType: [
        this.breachData!.breachFrequencyType.code,
        Validators.required
      ],
      breachAmountCalculationType: [
        this.breachData!.breachAmountCalculationType.code,
        Validators.required
      ],
      breachAmount: [
        this.breachData!.breachAmount,
        [
          amountValueValidator(),
          Validators.required
        ]
      ]
    });
  }

  submit(): void {
    const payload = this.breachForm.getRawValue();
    this.productsService.updateWrokingCapitalBreach(this.breachData.id, payload).subscribe({
      next: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('Failed to update breach configuration', err);
      }
    });
  }
}
