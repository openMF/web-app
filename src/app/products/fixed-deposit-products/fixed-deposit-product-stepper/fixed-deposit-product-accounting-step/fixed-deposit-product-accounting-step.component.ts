import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-fixed-deposit-product-accounting-step',
  templateUrl: './fixed-deposit-product-accounting-step.component.html',
  styleUrls: ['./fixed-deposit-product-accounting-step.component.scss']
})
export class FixedDepositProductAccountingStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() fixedDepositProductFormValid: boolean;

  fixedDepositProductAccountingForm: FormGroup;

  chargeData: any;
  penaltyData: any;
  paymentTypeData: any;
  assetAccountData: any;
  incomeAccountData: any;
  expenseAccountData: any;
  liabilityAccountData: any;

  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId', 'actions'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId', 'actions'];

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog) {
    this.createfixedDepositProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.chargeData = this.fixedDepositProductsTemplate.chargeOptions || [];
    this.penaltyData = this.fixedDepositProductsTemplate.penaltyOptions || [];
    this.paymentTypeData = this.fixedDepositProductsTemplate.paymentTypeOptions || [];
    this.assetAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.expenseAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
    this.liabilityAccountData = this.fixedDepositProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.assignAccountingStepData();
    }
  }

  assignAccountingStepData() {
    if (this.fixedDepositProductsTemplate.accountingRule.id === 2) {
      this.fixedDepositProductAccountingForm.patchValue({
        'accountingRule': this.fixedDepositProductsTemplate.accountingRule.id
      });
      this.fixedDepositProductAccountingForm.patchValue({
        'savingsReferenceAccountId': this.fixedDepositProductsTemplate.accountingMappings.savingsReferenceAccount.id,
        'savingsControlAccountId': this.fixedDepositProductsTemplate.accountingMappings.savingsControlAccount.id,
        'transfersInSuspenseAccountId': this.fixedDepositProductsTemplate.accountingMappings.transfersInSuspenseAccount.id,
        'incomeFromFeeAccountId': this.fixedDepositProductsTemplate.accountingMappings.incomeFromFeeAccount.id,
        'incomeFromPenaltyAccountId': this.fixedDepositProductsTemplate.accountingMappings.incomeFromPenaltyAccount.id,
        'interestOnSavingsAccountId': this.fixedDepositProductsTemplate.accountingMappings.interestOnSavingsAccount.id
      });
      if (this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings || this.fixedDepositProductsTemplate.feeToIncomeAccountMappings || this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings) {
        this.fixedDepositProductAccountingForm.patchValue({
          'advancedAccountingRules': true
        });
      }
      if (this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings) {
        this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings.forEach((paymentChannelToFundSourceMapping: any) => {
          const paymentChannelToFundSourceMappingData = this.formBuilder.group({
            paymentTypeId: [paymentChannelToFundSourceMapping.paymentType.id, Validators.required],
            fundSourceAccountId: [paymentChannelToFundSourceMapping.fundSourceAccount.id, Validators.required]
          });
          const formArray = this.fixedDepositProductAccountingForm.controls['paymentChannelToFundSourceMappings'] as FormArray;
          formArray.push(paymentChannelToFundSourceMappingData);
        });
      }
      if (this.fixedDepositProductsTemplate.feeToIncomeAccountMappings) {
        this.fixedDepositProductsTemplate.feeToIncomeAccountMappings.forEach((feeToIncomeAccountMapping: any) => {
          const feeToIncomeAccountMappingData = this.formBuilder.group({
            chargeId: [feeToIncomeAccountMapping.charge.id, Validators.required],
            incomeAccountId: [feeToIncomeAccountMapping.incomeAccount.id, Validators.required]
          });
          const formArray = this.fixedDepositProductAccountingForm.controls['feeToIncomeAccountMappings'] as FormArray;
          formArray.push(feeToIncomeAccountMappingData);
        });
      }
      if (this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings) {
        this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings.forEach((penaltyToIncomeAccountMapping: any) => {
          const penaltyToIncomeAccountMappingData = this.formBuilder.group({
            chargeId: [penaltyToIncomeAccountMapping.charge.id, Validators.required],
            incomeAccountId: [penaltyToIncomeAccountMapping.incomeAccount.id, Validators.required]
          });
          const formArray = this.fixedDepositProductAccountingForm.controls['penaltyToIncomeAccountMappings'] as FormArray;
          formArray.push(penaltyToIncomeAccountMappingData);
        });
      }
    }
  }

  createfixedDepositProductAccountingForm() {
    this.fixedDepositProductAccountingForm = this.formBuilder.group({
      'accountingRule': [1]
    });
  }

  setConditionalControls() {
    this.fixedDepositProductAccountingForm.get('accountingRule').valueChanges
      .subscribe((accountingRule: any) => {
        if (accountingRule === 2) {
          this.fixedDepositProductAccountingForm.addControl('savingsReferenceAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('savingsControlAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('transfersInSuspenseAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('interestOnSavingsAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('incomeFromFeeAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('incomeFromPenaltyAccountId', new FormControl('', Validators.required));
          this.fixedDepositProductAccountingForm.addControl('advancedAccountingRules', new FormControl(false));

          this.fixedDepositProductAccountingForm.get('advancedAccountingRules').valueChanges
            .subscribe((advancedAccountingRules: boolean) => {
              if (advancedAccountingRules) {
                this.fixedDepositProductAccountingForm.addControl('paymentChannelToFundSourceMappings', this.formBuilder.array([]));
                this.fixedDepositProductAccountingForm.addControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
                this.fixedDepositProductAccountingForm.addControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              } else {
                this.fixedDepositProductAccountingForm.removeControl('paymentChannelToFundSourceMappings');
                this.fixedDepositProductAccountingForm.removeControl('feeToIncomeAccountMappings');
                this.fixedDepositProductAccountingForm.removeControl('penaltyToIncomeAccountMappings');
              }
            });
        } else {
          this.fixedDepositProductAccountingForm.removeControl('savingsReferenceAccountId');
          this.fixedDepositProductAccountingForm.removeControl('overdraftPortfolioControlId');
          this.fixedDepositProductAccountingForm.removeControl('savingsControlAccountId');
          this.fixedDepositProductAccountingForm.removeControl('transfersInSuspenseAccountId');
          this.fixedDepositProductAccountingForm.removeControl('interestOnSavingsAccountId');
          this.fixedDepositProductAccountingForm.removeControl('writeOffAccountId');
          this.fixedDepositProductAccountingForm.removeControl('incomeFromFeeAccountId');
          this.fixedDepositProductAccountingForm.removeControl('incomeFromPenaltyAccountId');
          this.fixedDepositProductAccountingForm.removeControl('incomeFromInterestId');
          this.fixedDepositProductAccountingForm.removeControl('advancedAccountingRules');
          this.fixedDepositProductAccountingForm.removeControl('escheatLiabilityId');
        }
      });
  }

  get paymentChannelToFundSourceMappings(): FormArray {
    return this.fixedDepositProductAccountingForm.get('paymentChannelToFundSourceMappings') as FormArray;
  }

  get feeToIncomeAccountMappings(): FormArray {
    return this.fixedDepositProductAccountingForm.get('feeToIncomeAccountMappings') as FormArray;
  }

  get penaltyToIncomeAccountMappings(): FormArray {
    return this.fixedDepositProductAccountingForm.get('penaltyToIncomeAccountMappings') as FormArray;
  }

  add(formType: string, formArray: FormArray) {
    const data = { ...this.getData(formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.push(response.data);
      }
    });
  }

  edit(formType: string, formArray: FormArray, index: number) {
    const data = { ...this.getData(formType, formArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.at(index).patchValue(response.data.value);
      }
    });
  }

  delete(formArray: FormArray, index: number) {
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

  get fixedDepositProductAccounting() {
    return this.fixedDepositProductAccountingForm.value;
  }

}
