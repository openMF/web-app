/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';

import { RemittancesService } from '../../remittances.service';
import { RemittanceVendor } from '../../models/remittance.model';
import { ValidatedRecipient } from '../../models/beneficiary.model';

@Component({
  selector: 'mifosx-search-beneficiary-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinner,
    MatIcon
  ],
  templateUrl: './search-beneficiary-step.component.html',
  styleUrls: ['./search-beneficiary-step.component.scss']
})
export class SearchBeneficiaryStepComponent implements OnInit {
  @Input() vendor: RemittanceVendor | null = null;
  @Input() transactionId = '';
  @Output() recipientValidated = new EventEmitter<ValidatedRecipient>();

  private fb = inject(FormBuilder);
  private remittancesService = inject(RemittancesService);
  private translateService = inject(TranslateService);

  beneficiaryForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  documentTypes = [
    { value: 'NATIONAL_ID', label: 'labels.inputs.National ID' },
    { value: 'PASSPORT', label: 'labels.inputs.Passport' },
    { value: 'DRIVERS_LICENSE', label: "labels.inputs.Driver's License" },
    { value: 'VOTER_ID', label: 'labels.inputs.Voter ID' }
  ];

  ngOnInit(): void {
    this.beneficiaryForm = this.fb.group({
      givenName: [
        '',
        Validators.required
      ],
      lastName: [
        '',
        Validators.required
      ],
      documentType: [
        'NATIONAL_ID',
        Validators.required
      ],
      documentNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ]
    });
  }

  validateRecipient(): void {
    if (this.beneficiaryForm.invalid || !this.vendor) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { givenName, lastName, documentType, documentNumber } = this.beneficiaryForm.value;

    this.remittancesService
      .validateRecipient(this.vendor.headerValue, this.transactionId, {
        givenName,
        lastName,
        primaryDocument: {
          documentType,
          documentNumber
        }
      })
      .subscribe({
        next: (recipient) => {
          this.isLoading = false;
          if (recipient && recipient.valid) {
            // Merge form data into recipient so details show in Confirm step
            const enrichedRecipient: ValidatedRecipient = {
              ...recipient,
              firstName: givenName,
              givenName: givenName,
              lastName: lastName,
              primaryDocument: {
                documentType,
                documentNumber,
                issuingCountry: ''
              }
            };
            this.recipientValidated.emit(enrichedRecipient);
          } else {
            this.errorMessage = this.translateService.instant(
              'labels.text.Recipient is not valid for this transaction. Please check the details.'
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message ||
            this.translateService.instant(
              'labels.text.Recipient validation failed. Please check the document details and try again.'
            );
        }
      });
  }
}
