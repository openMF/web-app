import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { StringEnumOptionData } from '../../../../shared/models/option-data.model';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { NgFor } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loan-product-interest-refund-step',
  templateUrl: './loan-product-interest-refund-step.component.html',
  styleUrls: ['./loan-product-interest-refund-step.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatTooltip,
    NgFor,
    MatOption,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class LoanProductInterestRefundStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Output() supportedInterestRefundTypes = new EventEmitter<StringEnumOptionData[]>();

  loanProductInterestRefundForm: UntypedFormGroup;

  supportedInterestRefundTypesOptions: StringEnumOptionData[];

  constructor(private formBuilder: UntypedFormBuilder) {
    this.createLoanProductInterestRefundForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.supportedInterestRefundTypesOptions = this.loanProductsTemplate.supportedInterestRefundTypesOptions;
    const values: StringEnumOptionData[] = this.loanProductsTemplate.supportedInterestRefundTypes;
    const supportedInterestRefundTypes: string[] = this.mapStringEnumOptionToIdList(values);
    this.loanProductInterestRefundForm.patchValue({
      supportedInterestRefundTypes: supportedInterestRefundTypes
    });
    this.supportedInterestRefundTypes.emit(values);
  }

  createLoanProductInterestRefundForm() {
    this.loanProductInterestRefundForm = this.formBuilder.group({
      supportedInterestRefundTypes: ''
    });
  }

  setConditionalControls() {
    this.loanProductInterestRefundForm.get('supportedInterestRefundTypes').valueChanges.subscribe((value) => {
      this.supportedInterestRefundTypes.emit(
        this.mapIdToStringEnumOptionList(value, this.loanProductsTemplate.supportedInterestRefundTypesOptions)
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
