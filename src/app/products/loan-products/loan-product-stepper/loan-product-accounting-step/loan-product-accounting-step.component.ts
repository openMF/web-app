import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-loan-product-accounting-step',
  templateUrl: './loan-product-accounting-step.component.html',
  styleUrls: ['./loan-product-accounting-step.component.scss']
})
export class LoanProductAccountingStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() loanProductFormValid: boolean;

  loanProductAccountingForm: FormGroup;

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
    this.createLoanProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.chargeData = this.loanProductsTemplate.chargeOptions || [];
    this.penaltyData = this.loanProductsTemplate.penaltyOptions || [];
    this.paymentTypeData = this.loanProductsTemplate.paymentTypeOptions || [];
    this.assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
    this.incomeAccountData = this.loanProductsTemplate.accountingMappingOptions.incomeAccountOptions || [];
    this.expenseAccountData = this.loanProductsTemplate.accountingMappingOptions.expenseAccountOptions || [];
    this.liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
    this.incomeAndLiabilityAccountData = this.incomeAccountData.concat(this.liabilityAccountData);

    this.loanProductAccountingForm.patchValue({
      'accountingRule': this.loanProductsTemplate.accountingRule.id
    });

    switch (this.loanProductsTemplate.accountingRule.id) {
      case 3:
      case 4:
        this.loanProductAccountingForm.patchValue({
          'receivableInterestAccountId': this.loanProductsTemplate.accountingMappings.receivableInterestAccount.id,
          'receivableFeeAccountId': this.loanProductsTemplate.accountingMappings.receivableFeeAccount.id,
          'receivablePenaltyAccountId': this.loanProductsTemplate.accountingMappings.receivablePenaltyAccount.id,
        });
        /* falls through */
      case 2:
        this.loanProductAccountingForm.patchValue({
          'fundSourceAccountId': this.loanProductsTemplate.accountingMappings.fundSourceAccount.id,
          'loanPortfolioAccountId': this.loanProductsTemplate.accountingMappings.loanPortfolioAccount.id,
          'transfersInSuspenseAccountId': this.loanProductsTemplate.accountingMappings.transfersInSuspenseAccount.id,
          'interestOnLoanAccountId': this.loanProductsTemplate.accountingMappings.interestOnLoanAccount.id,
          'incomeFromFeeAccountId': this.loanProductsTemplate.accountingMappings.incomeFromFeeAccount.id,
          'incomeFromPenaltyAccountId': this.loanProductsTemplate.accountingMappings.incomeFromPenaltyAccount.id,
          'incomeFromRecoveryAccountId': this.loanProductsTemplate.accountingMappings.incomeFromRecoveryAccount.id,
          'writeOffAccountId': this.loanProductsTemplate.accountingMappings.writeOffAccount.id,
          'overpaymentLiabilityAccountId': this.loanProductsTemplate.accountingMappings.overpaymentLiabilityAccount.id,
          'advancedAccountingRules': (this.loanProductsTemplate.paymentChannelToFundSourceMappings || this.loanProductsTemplate.feeToIncomeAccountMappings || this.loanProductsTemplate.penaltyToIncomeAccountMappings) ? true : false
        });

        this.loanProductAccountingForm.setControl('paymentChannelToFundSourceMappings',
          this.formBuilder.array((this.loanProductsTemplate.paymentChannelToFundSourceMappings || []).map((paymentFundSource: any) =>
          ({ paymentTypeId: paymentFundSource.paymentType.id, fundSourceAccountId: paymentFundSource.fundSourceAccount.id }))));
        this.loanProductAccountingForm.setControl('feeToIncomeAccountMappings',
          this.formBuilder.array((this.loanProductsTemplate.feeToIncomeAccountMappings || []).map((feesIncome: any) =>
          ({ chargeId: feesIncome.charge.id, incomeAccountId: feesIncome.incomeAccount.id }))));
        this.loanProductAccountingForm.setControl('penaltyToIncomeAccountMappings',
          this.formBuilder.array((this.loanProductsTemplate.penaltyToIncomeAccountMappings || []).map((penaltyIncome: any) =>
          ({ chargeId: penaltyIncome.charge.id, incomeAccountId: penaltyIncome.incomeAccount.id }))));
    }
  }

  createLoanProductAccountingForm() {
    this.loanProductAccountingForm = this.formBuilder.group({
      'accountingRule': [1]
    });
  }

  setConditionalControls() {
    this.loanProductAccountingForm.get('accountingRule').valueChanges
      .subscribe((accountingRule: any) => {
        if (accountingRule >= 2 && accountingRule <= 4) {
          this.loanProductAccountingForm.addControl('fundSourceAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('loanPortfolioAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('transfersInSuspenseAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('interestOnLoanAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('incomeFromFeeAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('incomeFromPenaltyAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('incomeFromRecoveryAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('writeOffAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('overpaymentLiabilityAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('advancedAccountingRules', new FormControl(false));

          this.loanProductAccountingForm.get('advancedAccountingRules').valueChanges
            .subscribe((advancedAccountingRules: boolean) => {
              if (advancedAccountingRules) {
                this.loanProductAccountingForm.addControl('paymentChannelToFundSourceMappings', this.formBuilder.array([]));
                this.loanProductAccountingForm.addControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
                this.loanProductAccountingForm.addControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              } else {
                this.loanProductAccountingForm.removeControl('paymentChannelToFundSourceMappings');
                this.loanProductAccountingForm.removeControl('feeToIncomeAccountMappings');
                this.loanProductAccountingForm.removeControl('penaltyToIncomeAccountMappings');
              }
            });
        } else {
          this.loanProductAccountingForm.removeControl('fundSourceAccountId');
          this.loanProductAccountingForm.removeControl('loanPortfolioAccountId');
          this.loanProductAccountingForm.removeControl('transfersInSuspenseAccountId');
          this.loanProductAccountingForm.removeControl('interestOnLoanAccountId');
          this.loanProductAccountingForm.removeControl('incomeFromFeeAccountId');
          this.loanProductAccountingForm.removeControl('incomeFromPenaltyAccountId');
          this.loanProductAccountingForm.removeControl('incomeFromRecoveryAccountId');
          this.loanProductAccountingForm.removeControl('writeOffAccountId');
          this.loanProductAccountingForm.removeControl('overpaymentLiabilityAccountId');
          this.loanProductAccountingForm.removeControl('advancedAccountingRules');
        }

        if (accountingRule === 3 || accountingRule === 4) {
          this.loanProductAccountingForm.addControl('receivableInterestAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('receivableFeeAccountId', new FormControl('', Validators.required));
          this.loanProductAccountingForm.addControl('receivablePenaltyAccountId', new FormControl('', Validators.required));
        } else {
          this.loanProductAccountingForm.removeControl('receivableInterestAccountId');
          this.loanProductAccountingForm.removeControl('receivableFeeAccountId');
          this.loanProductAccountingForm.removeControl('receivablePenaltyAccountId');
        }
      });
  }

  get paymentChannelToFundSourceMappings(): FormArray {
    return this.loanProductAccountingForm.get('paymentChannelToFundSourceMappings') as FormArray;
  }

  get feeToIncomeAccountMappings(): FormArray {
    return this.loanProductAccountingForm.get('feeToIncomeAccountMappings') as FormArray;
  }

  get penaltyToIncomeAccountMappings(): FormArray {
    return this.loanProductAccountingForm.get('penaltyToIncomeAccountMappings') as FormArray;
  }

  setLoanProductAccountingFormDirty() {
    if (this.loanProductAccountingForm.pristine) {
      this.loanProductAccountingForm.markAsDirty();
    }
  }

  add(formType: string, formArray: FormArray) {
    const data = { ...this.getData(formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.push(response.data);
        this.setLoanProductAccountingFormDirty();
      }
    });
  }

  edit(formType: string, formArray: FormArray, index: number) {
    const data = { ...this.getData(formType, formArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.at(index).patchValue(response.data.value);
        this.setLoanProductAccountingFormDirty();
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
        this.setLoanProductAccountingFormDirty();
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
        value: values ? values.incomeAccountId : this.incomeAndLiabilityAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.incomeAndLiabilityAccountData },
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

  get loanProductAccounting() {
    return this.loanProductAccountingForm.value;
  }

}
