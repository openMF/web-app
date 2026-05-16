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
import { InputPositiveIntegerComponent } from 'app/shared/input-positive-integer/input-positive-integer.component';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'mifosx-create-near-breach-configuration',
  templateUrl: './create-near-breach-configuration.component.html',
  styleUrl: './create-near-breach-configuration.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputPositiveIntegerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNearBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);
  private errorHandler = inject(ErrorHandlerService);

  nearBreachForm: UntypedFormGroup;
  frequencyTypeOptions: StringEnumOptionData[] = [];
  maxThreshold: number = 100.0;

  constructor() {
    this.route.data.subscribe((data: { breachTemplate?: any }) => {
      const breachTemplate = data.breachTemplate ?? {};
      this.frequencyTypeOptions = breachTemplate.breachFrequencyTypeOptions || [];
    });
  }

  ngOnInit(): void {
    this.nearBreachForm = this.formBuilder.group({
      nearBreachName: [
        '',
        [
          Validators.required
        ]
      ],
      nearBreachFrequency: [
        '',
        [
          Validators.required
        ]
      ],
      nearBreachFrequencyType: [
        '',
        Validators.required
      ],
      nearBreachThreshold: [
        '',
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
    this.productsService
      .createWrokingCapitalNearBreach(payload)
      .pipe(catchError((error) => this.errorHandler.handleError(error, 'Near Breach Configuration Creation')))
      .subscribe({
        next: () => {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }
}
