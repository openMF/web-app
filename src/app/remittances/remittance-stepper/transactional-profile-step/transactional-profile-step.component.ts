/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TranslateService } from '@ngx-translate/core';
import { RemittancesService } from '../../remittances.service';
import { RemittanceTransaction, RemittanceVendor, PayoutAssignmentResponse } from '../../models/remittance.model';
import { ValidatedRecipient } from '../../models/beneficiary.model';

/**
 * Represents a single row in the Transactional Profile data table.
 * As required by the spec: # Remittance, Avg Amount/Transaction, # Senders, Sender Registry.
 */
export interface TransactionalProfileRow {
  remittanceNumber: string;
  averageAmount: number;
  currency: string;
  senderCount: number;
  senderRegistry: string;
}

@Component({
  selector: 'mifosx-transactional-profile-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressSpinner,
    MatIcon,
    MatTableModule,
    MatButtonToggleModule,
    FormsModule
  ],
  templateUrl: './transactional-profile-step.component.html',
  styleUrls: ['./transactional-profile-step.component.scss']
})
export class TransactionalProfileStepComponent implements OnInit {
  @Input() vendor: RemittanceVendor | null = null;
  @Input() transactionId = '';
  @Input() remittanceData: RemittanceTransaction | null = null;
  @Input() recipientData: ValidatedRecipient | null = null;
  @Output() payoutAssigned = new EventEmitter<PayoutAssignmentResponse>();

  private remittancesService = inject(RemittancesService);
  private fb = inject(FormBuilder);
  private translateService = inject(TranslateService);

  isLoading = false;
  errorMessage = '';

  /** Transactional profile data table */
  displayedColumns: string[] = [
    'remittanceNumber',
    'averageAmount',
    'senderCount',
    'senderRegistry'
  ];
  profileData: TransactionalProfileRow[] = [];

  /** Form for adding new profile entries */
  profileForm!: FormGroup;

  /** Entity type toggle: 'individual' or 'legal' */
  entityType: 'individual' | 'legal' = 'individual';

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      remittanceNumber: [
        '',
        Validators.required
      ],
      averageAmount: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      senderCount: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      senderRegistry: [
        '',
        Validators.required
      ]
    });

    // Pre-populate from the current transaction if available
    if (this.remittanceData) {
      this.profileData = [
        {
          remittanceNumber: this.remittanceData.pin,
          averageAmount: this.remittanceData.receivingAmount,
          currency: this.remittanceData.receivingCurrency,
          senderCount: 1,
          senderRegistry: this.remittanceData.senderName
        }
      ];
    }
  }

  addProfileEntry(): void {
    if (this.profileForm.invalid) return;
    const val = this.profileForm.value;
    this.profileData = [
      ...this.profileData,
      {
        remittanceNumber: val.remittanceNumber,
        averageAmount: val.averageAmount,
        currency: this.remittanceData?.receivingCurrency || 'USD',
        senderCount: Math.max(1, val.senderCount || 1),
        senderRegistry: val.senderRegistry
      }
    ];
    this.profileForm.reset({
      senderCount: 1
    });
  }

  removeProfileEntry(index: number): void {
    this.profileData = this.profileData.filter((_, i) => i !== index);
  }

  assignPayout(): void {
    if (!this.vendor || !this.recipientData) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.remittancesService
      .assignPayout(this.vendor.headerValue, this.transactionId, {
        additionalInfo: {
          comment: 'Payout assignment from web-app',
          transactionalProfile: JSON.stringify(this.profileData),
          entityType: this.entityType,
          profileEntryCount: this.profileData.length.toString()
        }
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.payoutAssigned.emit(response);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message ||
            this.translateService.instant('labels.text.Failed to assign payout. Please try again.');
        }
      });
  }
}
