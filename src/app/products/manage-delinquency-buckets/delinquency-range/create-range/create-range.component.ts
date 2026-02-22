/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-create-range',
  templateUrl: './create-range.component.html',
  styleUrls: ['./create-range.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class CreateRangeComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private settingsService = inject(SettingsService);

  /** Delinquency Range form. */
  delinquencyRangeForm: UntypedFormGroup;

  ngOnInit(): void {
    this.setInputForm();
  }

  /**
   * Create Input form.
   */
  setInputForm(): void {
    this.delinquencyRangeForm = this.formBuilder.group({
      classification: [
        '',
        [Validators.required]
      ],
      minimumAgeDays: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0|[1-9][0-9]*)$'),
          Validators.max(1000)
        ]
      ],
      maximumAgeDays: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0*[1-9][0-9]*)$'),
          Validators.max(10000)
        ]
      ]
    });
  }

  submit(): void {
    const delinquencyRangeFormData = this.delinquencyRangeForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...delinquencyRangeFormData,
      locale
    };
    this.productsService.createDelinquencyRange(data).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
