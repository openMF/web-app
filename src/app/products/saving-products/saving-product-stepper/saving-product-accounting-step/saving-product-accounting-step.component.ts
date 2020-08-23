import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-saving-product-accounting-step',
  templateUrl: './saving-product-accounting-step.component.html',
  styleUrls: ['./saving-product-accounting-step.component.scss']
})
export class SavingProductAccountingStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() isDormancyTrackingActive: FormControl;
  @Input() savingProductFormValid: boolean;

  savingProductAccountingForm: FormGroup;

  chargeData: any;
  penaltyData: any;
  paymentTypeData: any;
  assetAccountData: any;
  incomeAccountData: any;
  expenseAccountData: any;
  liabilityAccountData: any;
  incomeAndLiabilityAccountData: any;

  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId', 'actions'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId', 'actions'];

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog) {
    this.createsavingProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.chargeData = this.savingProductsTemplate.chargeOptions || [];
    this.penaltyData = this.savingProductsTemplate.penaltyOptions || [];
    this.paymentTypeData = this.savingProductsTemplate.paymentTypeOptions || [];
    this.assetAccountData = this.savingProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.savingProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.expenseAccountData = this.savingProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
    this.liabilityAccountData = this.savingProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];

    this.savingProductAccountingForm.patchValue({
      'accountingRule': this.savingProductsTemplate.accountingRule.id
    });

    if (this.savingProductsTemplate.accountingRule.id === 2) {
        this.savingProductAccountingForm.patchValue({
          'savingsReferenceAccountId': this.savingProductsTemplate.accountingMappings.savingsReferenceAccount.id,
          'overdraftPortfolioControlId': this.savingProductsTemplate.accountingMappings.overdraftPortfolioControl.id,
          'savingsControlAccountId': this.savingProductsTemplate.accountingMappings.savingsControlAccount.id,
          'transfersInSuspenseAccountId': this.savingProductsTemplate.accountingMappings.transfersInSuspenseAccount.id,
          'interestOnSavingsAccountId': this.savingProductsTemplate.accountingMappings.interestOnSavingsAccount.id,
          'writeOffAccountId': this.savingProductsTemplate.accountingMappings.writeOffAccount.id,
          'incomeFromFeeAccountId': this.savingProductsTemplate.accountingMappings.incomeFromFeeAccount.id,
          'incomeFromPenaltyAccountId': this.savingProductsTemplate.accountingMappings.incomeFromPenaltyAccount.id,
          'incomeFromInterestId': this.savingProductsTemplate.accountingMappings.incomeFromInterest.id,
          'escheatLiabilityId': this.savingProductsTemplate.accountingMappings.escheatLiabilityAccount.id,
          'advancedAccountingRules': (this.savingProductsTemplate.paymentChannelToFundSourceMappings || this.savingProductsTemplate.feeToIncomeAccountMappings || this.savingProductsTemplate.penaltyToIncomeAccountMappings) ? true : false
        });

        this.savingProductAccountingForm.setControl('paymentChannelToFundSourceMappings',
          this.formBuilder.array((this.savingProductsTemplate.paymentChannelToFundSourceMappings || []).map((paymentFundSource: any) =>
          ({ paymentTypeId: paymentFundSource.paymentType.id, fundSourceAccountId: paymentFundSource.fundSourceAccount.id }))));
        this.savingProductAccountingForm.setControl('feeToIncomeAccountMappings',
          this.formBuilder.array((this.savingProductsTemplate.feeToIncomeAccountMappings || []).map((feesIncome: any) =>
          ({ chargeId: feesIncome.charge.id, incomeAccountId: feesIncome.incomeAccount.id }))));
        this.savingProductAccountingForm.setControl('penaltyToIncomeAccountMappings',
          this.formBuilder.array((this.savingProductsTemplate.penaltyToIncomeAccountMappings || []).map((penaltyIncome: any) =>
          ({ chargeId: penaltyIncome.charge.id, incomeAccountId: penaltyIncome.incomeAccount.id }))));
    }
  }

  createsavingProductAccountingForm() {
    this.savingProductAccountingForm = this.formBuilder.group({
      'accountingRule': [1]
    });
  }

  setConditionalControls() {
    this.savingProductAccountingForm.get('accountingRule').valueChanges
      .subscribe((accountingRule: any) => {
        if (accountingRule === 2) {
          this.savingProductAccountingForm.addControl('savingsReferenceAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('overdraftPortfolioControlId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('savingsControlAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('transfersInSuspenseAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('interestOnSavingsAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('writeOffAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('incomeFromFeeAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('incomeFromPenaltyAccountId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('incomeFromInterestId', new FormControl('', Validators.required));
          this.savingProductAccountingForm.addControl('advancedAccountingRules', new FormControl(false));

          if (this.isDormancyTrackingActive.value) {
            this.savingProductAccountingForm.addControl('escheatLiabilityId', new FormControl('', Validators.required));
          }

          this.isDormancyTrackingActive.valueChanges
            .subscribe((isDormancyTrackingActive: boolean) => {
              if (isDormancyTrackingActive) {
                this.savingProductAccountingForm.addControl('escheatLiabilityId', new FormControl('', Validators.required));
              } else {
                this.savingProductAccountingForm.removeControl('escheatLiabilityId');
              }
            });

          this.savingProductAccountingForm.get('advancedAccountingRules').valueChanges
            .subscribe((advancedAccountingRules: boolean) => {
              if (advancedAccountingRules) {
                this.savingProductAccountingForm.addControl('paymentChannelToFundSourceMappings', this.formBuilder.array([]));
                this.savingProductAccountingForm.addControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
                this.savingProductAccountingForm.addControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              } else {
                this.savingProductAccountingForm.removeControl('paymentChannelToFundSourceMappings');
                this.savingProductAccountingForm.removeControl('feeToIncomeAccountMappings');
                this.savingProductAccountingForm.removeControl('penaltyToIncomeAccountMappings');
              }
            });
        } else {
          this.savingProductAccountingForm.removeControl('savingsReferenceAccountId');
          this.savingProductAccountingForm.removeControl('overdraftPortfolioControlId');
          this.savingProductAccountingForm.removeControl('savingsControlAccountId');
          this.savingProductAccountingForm.removeControl('transfersInSuspenseAccountId');
          this.savingProductAccountingForm.removeControl('interestOnSavingsAccountId');
          this.savingProductAccountingForm.removeControl('writeOffAccountId');
          this.savingProductAccountingForm.removeControl('incomeFromFeeAccountId');
          this.savingProductAccountingForm.removeControl('incomeFromPenaltyAccountId');
          this.savingProductAccountingForm.removeControl('incomeFromInterestId');
          this.savingProductAccountingForm.removeControl('advancedAccountingRules');
          this.savingProductAccountingForm.removeControl('escheatLiabilityId');
        }
      });
  }

  get paymentChannelToFundSourceMappings(): FormArray {
    return this.savingProductAccountingForm.get('paymentChannelToFundSourceMappings') as FormArray;
  }

  get feeToIncomeAccountMappings(): FormArray {
    return this.savingProductAccountingForm.get('feeToIncomeAccountMappings') as FormArray;
  }

  get penaltyToIncomeAccountMappings(): FormArray {
    return this.savingProductAccountingForm.get('penaltyToIncomeAccountMappings') as FormArray;
  }

  setSavingProductAccountingFormDirty() {
    if (this.savingProductAccountingForm.pristine) {
      this.savingProductAccountingForm.markAsDirty();
    }
  }

  add(formType: string, formArray: FormArray) {
    const data = { ...this.getData(formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.push(response.data);
        this.setSavingProductAccountingFormDirty();
      }
    });
  }

  edit(formType: string, formArray: FormArray, index: number) {
    const data = { ...this.getData(formType, formArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.at(index).patchValue(response.data.value);
        this.setSavingProductAccountingFormDirty();
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
        this.setSavingProductAccountingFormDirty();
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

  get savingProductAccounting() {
    return this.savingProductAccountingForm.value;
  }

}
