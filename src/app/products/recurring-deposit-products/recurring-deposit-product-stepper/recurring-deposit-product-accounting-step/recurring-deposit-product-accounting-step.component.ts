import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-recurring-deposit-product-accounting-step',
  templateUrl: './recurring-deposit-product-accounting-step.component.html',
  styleUrls: ['./recurring-deposit-product-accounting-step.component.scss']
})
export class RecurringDepositProductAccountingStepComponent implements OnInit {

  @Input() recurringDepositProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() recurringDepositProductFormValid: boolean;

  recurringDepositProductAccountingForm: UntypedFormGroup;

  chargeData: any;
  penaltyData: any;
  paymentTypeData: any;
  assetAccountData: any;
  incomeAccountData: any;
  expenseAccountData: any;
  liabilityAccountData: any;

  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId', 'actions'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId', 'actions'];

  constructor(private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog) {
    this.createrecurringDepositProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.chargeData = this.recurringDepositProductsTemplate.chargeOptions || [];
    this.penaltyData = this.recurringDepositProductsTemplate.penaltyOptions || [];
    this.paymentTypeData = this.recurringDepositProductsTemplate.paymentTypeOptions || [];
    this.assetAccountData = this.recurringDepositProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.recurringDepositProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.expenseAccountData = this.recurringDepositProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
    this.liabilityAccountData = this.recurringDepositProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.assignAccountingStepData();
    }
  }

  assignAccountingStepData() {
    if (this.recurringDepositProductsTemplate.accountingRule.id === 2) {
      this.recurringDepositProductAccountingForm.patchValue({
        'accountingRule': this.recurringDepositProductsTemplate.accountingRule.id
      });
      this.recurringDepositProductAccountingForm.patchValue({
        'savingsReferenceAccountId': this.recurringDepositProductsTemplate.accountingMappings.savingsReferenceAccount.id,
        'savingsControlAccountId': this.recurringDepositProductsTemplate.accountingMappings.savingsControlAccount.id,
        'transfersInSuspenseAccountId': this.recurringDepositProductsTemplate.accountingMappings.transfersInSuspenseAccount.id,
        'incomeFromFeeAccountId': this.recurringDepositProductsTemplate.accountingMappings.incomeFromFeeAccount.id,
        'incomeFromPenaltyAccountId': this.recurringDepositProductsTemplate.accountingMappings.incomeFromPenaltyAccount.id,
        'interestOnSavingsAccountId': this.recurringDepositProductsTemplate.accountingMappings.interestOnSavingsAccount.id
      });
      if (this.recurringDepositProductsTemplate.paymentChannelToFundSourceMappings || this.recurringDepositProductsTemplate.feeToIncomeAccountMappings || this.recurringDepositProductsTemplate.penaltyToIncomeAccountMappings) {
        this.recurringDepositProductAccountingForm.patchValue({
          'advancedAccountingRules': true
        });
      }
      if (this.recurringDepositProductsTemplate.paymentChannelToFundSourceMappings) {
        this.recurringDepositProductsTemplate.paymentChannelToFundSourceMappings.forEach((paymentChannelToFundSourceMapping: any) => {
          const paymentChannelToFundSourceMappingData = this.formBuilder.group({
            paymentTypeId: [paymentChannelToFundSourceMapping.paymentType.id, Validators.required],
            fundSourceAccountId: [paymentChannelToFundSourceMapping.fundSourceAccount.id, Validators.required]
          });
          const formArray = this.recurringDepositProductAccountingForm.controls['paymentChannelToFundSourceMappings'] as UntypedFormArray;
          formArray.push(paymentChannelToFundSourceMappingData);
        });
      }
      if (this.recurringDepositProductsTemplate.feeToIncomeAccountMappings) {
        this.recurringDepositProductsTemplate.feeToIncomeAccountMappings.forEach((feeToIncomeAccountMapping: any) => {
          const feeToIncomeAccountMappingData = this.formBuilder.group({
            chargeId: [feeToIncomeAccountMapping.charge.id, Validators.required],
            incomeAccountId: [feeToIncomeAccountMapping.incomeAccount.id, Validators.required]
          });
          const formArray = this.recurringDepositProductAccountingForm.controls['feeToIncomeAccountMappings'] as UntypedFormArray;
          formArray.push(feeToIncomeAccountMappingData);
        });
      }
      if (this.recurringDepositProductsTemplate.penaltyToIncomeAccountMappings) {
        this.recurringDepositProductsTemplate.penaltyToIncomeAccountMappings.forEach((penaltyToIncomeAccountMapping: any) => {
          const penaltyToIncomeAccountMappingData = this.formBuilder.group({
            chargeId: [penaltyToIncomeAccountMapping.charge.id, Validators.required],
            incomeAccountId: [penaltyToIncomeAccountMapping.incomeAccount.id, Validators.required]
          });
          const formArray = this.recurringDepositProductAccountingForm.controls['penaltyToIncomeAccountMappings'] as UntypedFormArray;
          formArray.push(penaltyToIncomeAccountMappingData);
        });
      }
    }
  }

  createrecurringDepositProductAccountingForm() {
    this.recurringDepositProductAccountingForm = this.formBuilder.group({
      'accountingRule': [1]
    });
  }

  setConditionalControls() {
    this.recurringDepositProductAccountingForm.get('accountingRule').valueChanges
      .subscribe((accountingRule: any) => {
        if (accountingRule === 2) {
          this.recurringDepositProductAccountingForm.addControl('savingsReferenceAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('savingsControlAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('transfersInSuspenseAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('interestOnSavingsAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('incomeFromFeeAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('incomeFromPenaltyAccountId', new UntypedFormControl('', Validators.required));
          this.recurringDepositProductAccountingForm.addControl('advancedAccountingRules', new UntypedFormControl(false));

          this.recurringDepositProductAccountingForm.get('advancedAccountingRules').valueChanges
            .subscribe((advancedAccountingRules: boolean) => {
              if (advancedAccountingRules) {
                this.recurringDepositProductAccountingForm.addControl('paymentChannelToFundSourceMappings', this.formBuilder.array([]));
                this.recurringDepositProductAccountingForm.addControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
                this.recurringDepositProductAccountingForm.addControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              } else {
                this.recurringDepositProductAccountingForm.removeControl('paymentChannelToFundSourceMappings');
                this.recurringDepositProductAccountingForm.removeControl('feeToIncomeAccountMappings');
                this.recurringDepositProductAccountingForm.removeControl('penaltyToIncomeAccountMappings');
              }
            });
        } else {
          this.recurringDepositProductAccountingForm.removeControl('savingsReferenceAccountId');
          this.recurringDepositProductAccountingForm.removeControl('overdraftPortfolioControlId');
          this.recurringDepositProductAccountingForm.removeControl('savingsControlAccountId');
          this.recurringDepositProductAccountingForm.removeControl('transfersInSuspenseAccountId');
          this.recurringDepositProductAccountingForm.removeControl('interestOnSavingsAccountId');
          this.recurringDepositProductAccountingForm.removeControl('writeOffAccountId');
          this.recurringDepositProductAccountingForm.removeControl('incomeFromFeeAccountId');
          this.recurringDepositProductAccountingForm.removeControl('incomeFromPenaltyAccountId');
          this.recurringDepositProductAccountingForm.removeControl('incomeFromInterestId');
          this.recurringDepositProductAccountingForm.removeControl('advancedAccountingRules');
          this.recurringDepositProductAccountingForm.removeControl('escheatLiabilityId');
        }
      });
  }

  get paymentChannelToFundSourceMappings(): UntypedFormArray {
    return this.recurringDepositProductAccountingForm.get('paymentChannelToFundSourceMappings') as UntypedFormArray;
  }

  get feeToIncomeAccountMappings(): UntypedFormArray {
    return this.recurringDepositProductAccountingForm.get('feeToIncomeAccountMappings') as UntypedFormArray;
  }

  get penaltyToIncomeAccountMappings(): UntypedFormArray {
    return this.recurringDepositProductAccountingForm.get('penaltyToIncomeAccountMappings') as UntypedFormArray;
  }

  add(formType: string, formArray: UntypedFormArray) {
    const data = { ...this.getData(formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.push(response.data);
      }
    });
  }

  edit(formType: string, formArray: UntypedFormArray, index: number) {
    const data = { ...this.getData(formType, formArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.at(index).patchValue(response.data.value);
      }
    });
  }

  delete(formArray: UntypedFormArray, index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        formArray.removeAt(index);
      }
    });
  }

  getData(formType: string, values?: any) {
    switch (formType) {
      case 'PaymentFundSource': return { title: 'Configure Fund Sources for Payment Channels', formfields: this.getPaymentFundSourceFormfields(values) };
      case 'FeesIncome': return { title: 'Map Fees to Income Accounts', formfields: this.getFeesIncomeFormfields(values) };
      case 'PenaltyIncome': return { title: 'Map Penalties to Specific Income Accounts', formfields: this.getPenaltyIncomeFormfields(values) };
    }
  }

  getPaymentFundSourceFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'paymentTypeId',
        label: 'Payment Type',
        value: values ? values.paymentTypeId : this.paymentTypeData[0].id,
        options: { label: 'name', value: 'id', data: this.paymentTypeData },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'fundSourceAccountId',
        label: 'Fund Source',
        value: values ? values.fundSourceAccountId : this.assetAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.assetAccountData },
        required: true,
        order: 2
      })
    ];
    return formfields;
  }

  getFeesIncomeFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'chargeId',
        label: 'Fees',
        value: values ? values.chargeId : this.chargeData[0].id,
        options: { label: 'name', value: 'id', data: this.chargeData },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'incomeAccountId',
        label: 'Income Account',
        value: values ? values.incomeAccountId : this.incomeAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.incomeAccountData },
        required: true,
        order: 2
      })
    ];
    return formfields;
  }

  getPenaltyIncomeFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'chargeId',
        label: 'Penalty',
        value: values ? values.chargeId : this.penaltyData[0].id,
        options: { label: 'name', value: 'id', data: this.penaltyData },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'incomeAccountId',
        label: 'Income Account',
        value: values ? values.incomeAccountId : this.incomeAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.incomeAccountData },
        required: true,
        order: 2
      })
    ];
    return formfields;
  }

  get recurringDepositProductAccounting() {
    return this.recurringDepositProductAccountingForm.value;
  }

}
