/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

import { TranslateService } from '@ngx-translate/core';
import { RemittancesService } from '../../remittances.service';
import { RemittanceTransaction, RemittanceVendor } from '../../models/remittance.model';

@Component({
  selector: 'mifosx-search-remittance-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinner,
    MatIcon
  ],
  templateUrl: './search-remittance-step.component.html',
  styleUrls: ['./search-remittance-step.component.scss']
})
export class SearchRemittanceStepComponent implements OnInit {
  @Output() remittanceFound = new EventEmitter<{
    transaction: RemittanceTransaction;
    transactionId: string;
    vendor: RemittanceVendor;
  }>();

  private fb = inject(FormBuilder);
  private remittancesService = inject(RemittancesService);
  private translateService = inject(TranslateService);

  searchForm!: FormGroup;
  vendors: RemittanceVendor[] = [];
  isLoading = false;
  isLoadingVendors = false;
  vendorLoadError = false;
  errorMessage = '';

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      vendor: [
        '',
        Validators.required
      ],
      externalId: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ]
    });

    this.loadVendors();
  }

  loadVendors(): void {
    this.isLoadingVendors = true;
    this.vendorLoadError = false;
    this.remittancesService.getVendors().subscribe({
      next: (response) => {
        this.vendors = response.vendors;
        this.isLoadingVendors = false;
        this.vendorLoadError = false;
        if (this.vendors.length === 1) {
          this.searchForm.patchValue({ vendor: this.vendors[0].headerValue });
        }
      },
      error: () => {
        this.vendorLoadError = true;
        this.isLoadingVendors = false;
      }
    });
  }

  searchRemittance(): void {
    this.searchForm.markAllAsTouched();
    if (this.searchForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { vendor, externalId } = this.searchForm.value;
    const selectedVendor = this.vendors.find((v) => v.headerValue === vendor);

    this.remittancesService.findRemittance(vendor, externalId).subscribe({
      next: (transaction) => {
        this.isLoading = false;
        this.remittanceFound.emit({
          transaction,
          transactionId: transaction.externalTransactionId || externalId,
          vendor: selectedVendor || { name: vendor, headerValue: vendor }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          this.translateService.instant(
            'labels.text.Remittance not found. Please check the reference number and try again.'
          );
      }
    });
  }
}
