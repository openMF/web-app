import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
