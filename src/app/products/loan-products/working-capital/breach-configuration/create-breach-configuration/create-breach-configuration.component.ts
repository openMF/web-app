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
  selector: 'mifosx-create-breach-configuration',
  templateUrl: './create-breach-configuration.component.html',
  styleUrl: './create-breach-configuration.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputPositiveIntegerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);
  private errorHandler = inject(ErrorHandlerService);

  breachForm: UntypedFormGroup;

  breachFrequencyTypeOptions: StringEnumOptionData[] = [];
  breachAmountCalculationTypeOptions: StringEnumOptionData[] = [];

  constructor() {
    this.route.data.subscribe((data: { breachTemplate?: any }) => {
      const breachTemplate = data.breachTemplate ?? {};
      this.breachFrequencyTypeOptions = breachTemplate.breachFrequencyTypeOptions || [];
      this.breachAmountCalculationTypeOptions = breachTemplate.breachAmountCalculationTypeOptions || [];
    });
  }

  ngOnInit(): void {
    this.breachForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required
        ]
      ],
      breachFrequency: [
        '',
        [
          Validators.required
        ]
      ],
      breachFrequencyType: [
        '',
        Validators.required
      ],
      breachAmountCalculationType: [
        '',
        Validators.required
      ],
      breachAmount: [
        '',
        [
          amountValueValidator(),
          Validators.required
        ]
      ]
    });
  }

  submit(): void {
    const payload = this.breachForm.getRawValue();
    this.productsService
      .createWrokingCapitalBreach(payload)
      .pipe(catchError((error) => this.errorHandler.handleError(error, 'Breach Configuration Creation')))
      .subscribe({
        next: () => {
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }
}
