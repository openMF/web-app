/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { StringEnumOptionData } from '../../../../shared/models/option-data.model';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-interest-refund-step',
  templateUrl: './loan-product-interest-refund-step.component.html',
  styleUrls: ['./loan-product-interest-refund-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductInterestRefundStepComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() loanProductsTemplate: any;
  @Output() supportedInterestRefundTypes = new EventEmitter<StringEnumOptionData[]>();
  @Output() supportedFeeRefundTypes = new EventEmitter<StringEnumOptionData[]>();

  loanProductInterestRefundForm: UntypedFormGroup;

  supportedInterestRefundTypesOptions: StringEnumOptionData[];
  supportedFeeRefundTypesOptions: StringEnumOptionData[];

  constructor() {
    this.createLoanProductInterestRefundForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.supportedInterestRefundTypesOptions = this.loanProductsTemplate.supportedInterestRefundTypesOptions;
    this.supportedFeeRefundTypesOptions = this.loanProductsTemplate.supportedFeeRefundTypesOptions ?? [];
    const interestValues: StringEnumOptionData[] = this.loanProductsTemplate.supportedInterestRefundTypes ?? [];
    const feeValues: StringEnumOptionData[] = this.loanProductsTemplate.supportedFeeRefundTypes ?? [];
    this.loanProductInterestRefundForm.patchValue({
      supportedInterestRefundTypes: this.mapStringEnumOptionToIdList(interestValues),
      supportedFeeRefundTypes: this.mapStringEnumOptionToIdList(feeValues)
    });
    this.supportedInterestRefundTypes.emit(interestValues);
    this.supportedFeeRefundTypes.emit(feeValues);
  }

  createLoanProductInterestRefundForm() {
    this.loanProductInterestRefundForm = this.formBuilder.group({
      supportedInterestRefundTypes: '',
      supportedFeeRefundTypes: ''
    });
  }

  setConditionalControls() {
    this.loanProductInterestRefundForm.get('supportedInterestRefundTypes').valueChanges.subscribe((value) => {
      this.supportedInterestRefundTypes.emit(
        this.mapIdToStringEnumOptionList(value, this.loanProductsTemplate.supportedInterestRefundTypesOptions)
      );
    });
    this.loanProductInterestRefundForm.get('supportedFeeRefundTypes').valueChanges.subscribe((value) => {
      this.supportedFeeRefundTypes.emit(
        this.mapIdToStringEnumOptionList(value, this.loanProductsTemplate.supportedFeeRefundTypesOptions ?? [])
      );
    });
  }

  mapStringEnumOptionToIdList(incomingValues: StringEnumOptionData[]): string[] {
    if (!incomingValues) {
      return [];
    }
    return incomingValues.map((v) => v.id);
  }

  mapIdToStringEnumOptionList(incomingValues: string[], options: StringEnumOptionData[]): StringEnumOptionData[] {
    return options.filter((v) => incomingValues.includes(v.id));
  }
}
