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
import { NearBreach } from 'app/products/loan-products/models/loan-product.model';
import { InputPositiveIntegerComponent } from 'app/shared/input-positive-integer/input-positive-integer.component';

@Component({
  selector: 'mifosx-edit-near-breach-configuration',
  templateUrl: './edit-near-breach-configuration.component.html',
  styleUrl: './edit-near-breach-configuration.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputPositiveIntegerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNearBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);

  nearBreachForm: UntypedFormGroup;

  nearBreachData: NearBreach | null = null;
  frequencyTypeOptions: StringEnumOptionData[] = [];
  maxThreshold: number = 100.0;

  ngOnInit(): void {
    this.route.data.subscribe((data: { nearBreachData: NearBreach; breachTemplate: any }) => {
      this.nearBreachData = data.nearBreachData;
      this.frequencyTypeOptions = data.breachTemplate.breachFrequencyTypeOptions || [];
      this.initForm();
    });
  }

  private initForm(): void {
    this.nearBreachForm = this.formBuilder.group({
      nearBreachName: [
        this.nearBreachData!.name,
        [
          Validators.required
        ]
      ],
      nearBreachFrequency: [
        this.nearBreachData!.frequency,
        [
          Validators.required
        ]
      ],
      nearBreachFrequencyType: [
        this.nearBreachData!.frequencyType.code,
        Validators.required
      ],
      nearBreachThreshold: [
        this.nearBreachData!.threshold,
        [
          amountValueValidator(),
          Validators.required,
          Validators.min(0),
          Validators.max(this.maxThreshold)
        ]
      ]
    });
  }

  submit(): void {
    const payload = this.nearBreachForm.getRawValue();
    this.productsService.updateWrokingCapitalNearBreach(this.nearBreachData.id, payload).subscribe({
      next: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('Failed to update near breach configuration', err);
      }
    });
  }
}
