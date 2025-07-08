import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

import { TranslateService } from '@ngx-translate/core';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { ChargeOffReasonToExpenseAccountMapping } from 'app/shared/models/general.model';
import { DeferredIncomeRecognition } from '../loan-product-payment-strategy-step/payment-allocation-model';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { GlAccountSelectorComponent } from '../../../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FindPipe } from '../../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-accounting-step',
  templateUrl: './loan-product-accounting-step.component.html',
  styleUrls: ['./loan-product-accounting-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioGroup,
    MatRadioButton,
    MatDivider,
    MatCheckbox,
    GlAccountSelectorComponent,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    MatStepperNext,
    FindPipe
  ]
})
export class LoanProductAccountingStepComponent implements OnInit, OnChanges {
  @Input() loanProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() loanProductFormValid: boolean;
  @Input() deferredIncomeRecognition: DeferredIncomeRecognition;

  loanProductAccountingForm: UntypedFormGroup;

  chargeData: any;
  penaltyData: any;
  paymentTypeData: any;
  assetAccountData: any;
  incomeAccountData: any;
  expenseAccountData: any;
  liabilityAccountData: any;
  incomeAndLiabilityAccountData: any;
  assetAndLiabilityAccountData: any;
  chargeOffReasonOptions: any;

  currentFormValues: any[] = [];
  allowAddChargeOffReasonExpense = true;

  paymentFundSourceDisplayedColumns: string[] = [
    'paymentTypeId',
    'fundSourceAccountId',
    'actions'
  ];
  feesPenaltyIncomeDisplayedColumns: string[] = [
    'chargeId',
    'incomeAccountId',
    'actions'
  ];
  chargeOffReasonExpenseDisplayedColumns: string[] = [
    'chargeOffReasonCodeValueId',
    'expenseAccountId',
    'actions'
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.createLoanProductAccountingForm();
    this.setConditionalControls();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setDeferredIncomeRecognitionControls();
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
    this.assetAndLiabilityAccountData =
      this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions || [];
    this.chargeOffReasonOptions = this.loanProductsTemplate.chargeOffReasonOptions || [];

    this.loanProductAccountingForm.patchValue({
      accountingRule: this.loanProductsTemplate.accountingRule.id
    });

    const accountingMappings = this.loanProductsTemplate.accountingMappings;
    this.setDeferredIncomeRecognitionControls();
    switch (this.loanProductsTemplate.accountingRule.id) {
      case 3:
      case 4:
        this.loanProductAccountingForm.patchValue({
          receivableInterestAccountId: accountingMappings.receivableInterestAccount.id,
          receivableFeeAccountId: accountingMappings.receivableFeeAccount.id,
          receivablePenaltyAccountId: accountingMappings.receivablePenaltyAccount.id
        });
        this.loanProductAccountingForm.patchValue({
          enableAccrualActivityPosting: this.loanProductsTemplate.enableAccrualActivityPosting
        });
        if (this.deferredIncomeRecognition) {
          if (this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization) {
            this.loanProductAccountingForm.patchValue({
              deferredIncomeLiabilityAccountId: accountingMappings.deferredIncomeLiabilityAccount.id,
              incomeFromCapitalizationAccountId: accountingMappings.incomeFromCapitalizationAccount.id
            });
          }
          if (this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee) {
            this.loanProductAccountingForm.patchValue({
              deferredIncomeLiabilityAccountId: accountingMappings.deferredIncomeLiabilityAccount.id,
              buyDownExpenseAccountId: accountingMappings.buyDownExpenseAccount.id,
              incomeFromBuyDownAccountId: accountingMappings.incomeFromBuyDownAccount.id
            });
          }
        }
      /* falls through */
      case 2:
        this.loanProductAccountingForm.patchValue({
          fundSourceAccountId: accountingMappings.fundSourceAccount.id,
          loanPortfolioAccountId: accountingMappings.loanPortfolioAccount.id,
          transfersInSuspenseAccountId: accountingMappings.transfersInSuspenseAccount.id,
          interestOnLoanAccountId: accountingMappings.interestOnLoanAccount.id,
          incomeFromFeeAccountId: accountingMappings.incomeFromFeeAccount.id,
          incomeFromPenaltyAccountId: accountingMappings.incomeFromPenaltyAccount.id,
          incomeFromRecoveryAccountId: accountingMappings.incomeFromRecoveryAccount.id,
          writeOffAccountId: accountingMappings.writeOffAccount.id,
          goodwillCreditAccountId: accountingMappings.goodwillCreditAccount?.id || null,
          overpaymentLiabilityAccountId: accountingMappings.overpaymentLiabilityAccount.id,
          chargeOffFraudExpenseAccountId: accountingMappings.chargeOffFraudExpenseAccount
            ? accountingMappings.chargeOffFraudExpenseAccount.id
            : '',
          chargeOffExpenseAccountId: accountingMappings.chargeOffExpenseAccount
            ? accountingMappings.chargeOffExpenseAccount.id
            : '',
          incomeFromChargeOffPenaltyAccountId: accountingMappings.incomeFromChargeOffPenaltyAccount
            ? accountingMappings.incomeFromChargeOffPenaltyAccount.id
            : '',
          incomeFromChargeOffFeesAccountId: accountingMappings.incomeFromChargeOffFeesAccount
            ? accountingMappings.incomeFromChargeOffFeesAccount.id
            : '',
          incomeFromChargeOffInterestAccountId: accountingMappings.incomeFromChargeOffInterestAccount
            ? accountingMappings.incomeFromChargeOffInterestAccount.id
            : '',
          incomeFromGoodwillCreditInterestAccountId: accountingMappings.incomeFromGoodwillCreditInterestAccount
            ? accountingMappings.incomeFromGoodwillCreditInterestAccount.id
            : '',
          incomeFromGoodwillCreditFeesAccountId: accountingMappings.incomeFromGoodwillCreditFeesAccount
            ? accountingMappings.incomeFromGoodwillCreditFeesAccount.id
            : '',
          incomeFromGoodwillCreditPenaltyAccountId: accountingMappings.incomeFromGoodwillCreditPenaltyAccount
            ? accountingMappings.incomeFromGoodwillCreditPenaltyAccount.id
            : '',
          advancedAccountingRules:
            this.loanProductsTemplate.paymentChannelToFundSourceMappings ||
            this.loanProductsTemplate.feeToIncomeAccountMappings ||
            this.loanProductsTemplate.penaltyToIncomeAccountMappings ||
            this.loanProductsTemplate.chargeOffReasonToExpenseAccountMappings
              ? true
              : false
        });

        this.loanProductAccountingForm.setControl(
          'paymentChannelToFundSourceMappings',
          this.formBuilder.array(
            (this.loanProductsTemplate.paymentChannelToFundSourceMappings || []).map((paymentFundSource: any) => ({
              paymentTypeId: paymentFundSource.paymentType.id,
              fundSourceAccountId: paymentFundSource.fundSourceAccount.id
            }))
          )
        );
        this.loanProductAccountingForm.setControl(
          'feeToIncomeAccountMappings',
          this.formBuilder.array(
            (this.loanProductsTemplate.feeToIncomeAccountMappings || []).map((feesIncome: any) => ({
              chargeId: feesIncome.charge.id,
              incomeAccountId: feesIncome.incomeAccount.id
            }))
          )
        );
        this.loanProductAccountingForm.setControl(
          'penaltyToIncomeAccountMappings',
          this.formBuilder.array(
            (this.loanProductsTemplate.penaltyToIncomeAccountMappings || []).map((penaltyIncome: any) => ({
              chargeId: penaltyIncome.charge.id,
              incomeAccountId: penaltyIncome.incomeAccount.id
            }))
          )
        );
        this.loanProductAccountingForm.setControl(
          'chargeOffReasonToExpenseAccountMappings',
          this.formBuilder.array(
            (this.loanProductsTemplate.chargeOffReasonToExpenseAccountMappings || []).map(
              (m: ChargeOffReasonToExpenseAccountMapping) => ({
                chargeOffReasonCodeValueId: m.chargeOffReasonCodeValue.id,
                expenseAccountId: m.expenseAccount.id
              })
            )
          )
        );
    }
  }

  createLoanProductAccountingForm() {
    this.loanProductAccountingForm = this.formBuilder.group({
      accountingRule: [1]
    });
  }

  setConditionalControls() {
    this.loanProductAccountingForm.get('accountingRule').valueChanges.subscribe((accountingRule: any) => {
      if (accountingRule >= 2 && accountingRule <= 4) {
        this.loanProductAccountingForm.addControl(
          'fundSourceAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'loanPortfolioAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'transfersInSuspenseAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'interestOnLoanAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromFeeAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromPenaltyAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromRecoveryAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl('writeOffAccountId', new UntypedFormControl('', Validators.required));
        this.loanProductAccountingForm.addControl(
          'goodwillCreditAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'overpaymentLiabilityAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl('advancedAccountingRules', new UntypedFormControl(false));
        this.loanProductAccountingForm.addControl(
          'chargeOffFraudExpenseAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'chargeOffExpenseAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromChargeOffPenaltyAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromChargeOffFeesAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromChargeOffInterestAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromGoodwillCreditInterestAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromGoodwillCreditFeesAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'incomeFromGoodwillCreditPenaltyAccountId',
          new UntypedFormControl('', Validators.required)
        );

        this.loanProductAccountingForm
          .get('advancedAccountingRules')
          .valueChanges.subscribe((advancedAccountingRules: boolean) => {
            if (advancedAccountingRules) {
              this.loanProductAccountingForm.addControl(
                'paymentChannelToFundSourceMappings',
                this.formBuilder.array([])
              );
              this.loanProductAccountingForm.addControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
              this.loanProductAccountingForm.addControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              this.loanProductAccountingForm.addControl(
                'chargeOffReasonToExpenseAccountMappings',
                this.formBuilder.array([])
              );
            } else {
              this.loanProductAccountingForm.setControl(
                'paymentChannelToFundSourceMappings',
                this.formBuilder.array([])
              );
              this.loanProductAccountingForm.setControl('feeToIncomeAccountMappings', this.formBuilder.array([]));
              this.loanProductAccountingForm.setControl('penaltyToIncomeAccountMappings', this.formBuilder.array([]));
              this.loanProductAccountingForm.setControl(
                'chargeOffReasonToExpenseAccountMappings',
                this.formBuilder.array([])
              );
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
        this.loanProductAccountingForm.removeControl('goodwillCreditAccountId');
        this.loanProductAccountingForm.removeControl('overpaymentLiabilityAccountId');
        this.loanProductAccountingForm.removeControl('advancedAccountingRules');
        this.loanProductAccountingForm.removeControl('chargeOffExpenseAccountId');
        this.loanProductAccountingForm.removeControl('chargeOffFraudExpenseAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromChargeOffPenaltyAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromChargeOffFeesAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromChargeOffInterestAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromGoodwillCreditInterestAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromGoodwillCreditFeesAccountId');
        this.loanProductAccountingForm.removeControl('incomeFromGoodwillCreditPenaltyAccountId');
      }

      if (accountingRule === 3 || accountingRule === 4) {
        this.loanProductAccountingForm.addControl(
          'receivableInterestAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'receivableFeeAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl(
          'receivablePenaltyAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.loanProductAccountingForm.addControl('enableAccrualActivityPosting', new UntypedFormControl(false));
      } else {
        this.loanProductAccountingForm.removeControl('receivableInterestAccountId');
        this.loanProductAccountingForm.removeControl('receivableFeeAccountId');
        this.loanProductAccountingForm.removeControl('receivablePenaltyAccountId');
        this.loanProductAccountingForm.removeControl('enableAccrualActivityPosting');
      }
    });
  }

  get paymentChannelToFundSourceMappings(): UntypedFormArray {
    return this.loanProductAccountingForm.get('paymentChannelToFundSourceMappings') as UntypedFormArray;
  }

  get feeToIncomeAccountMappings(): UntypedFormArray {
    return this.loanProductAccountingForm.get('feeToIncomeAccountMappings') as UntypedFormArray;
  }

  get penaltyToIncomeAccountMappings(): UntypedFormArray {
    return this.loanProductAccountingForm.get('penaltyToIncomeAccountMappings') as UntypedFormArray;
  }

  get chargeOffReasonToExpenseAccountMappings(): UntypedFormArray {
    return this.loanProductAccountingForm.get('chargeOffReasonToExpenseAccountMappings') as UntypedFormArray;
  }

  setLoanProductAccountingFormDirty() {
    if (this.loanProductAccountingForm.pristine) {
      this.loanProductAccountingForm.markAsDirty();
    }
  }

  add(formType: string, formArray: UntypedFormArray) {
    this.currentFormValues = [];
    if (formType == 'ChargeOffReasonExpense') {
      this.allowAddChargeOffReasonExpense = true;
      formArray.value.forEach((item: any) => this.currentFormValues.push(item.chargeOffReasonCodeValueId));
      if (this.chargeOffReasonOptions.length == this.currentFormValues.length) {
        this.allowAddChargeOffReasonExpense = false;
        return;
      }
    }
    const data = { ...this.getData(formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.push(response.data);
        if (formType == 'ChargeOffReasonExpense') {
          this.allowAddChargeOffReasonExpense = formArray.value.length < this.chargeOffReasonOptions.length;
        }

        this.setLoanProductAccountingFormDirty();
      }
    });
  }

  edit(formType: string, formArray: UntypedFormArray, index: number) {
    const data = { ...this.getData(formType, formArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        formArray.at(index).patchValue(response.data.value);
        this.setLoanProductAccountingFormDirty();
      }
    });
  }

  delete(formType: string, formArray: UntypedFormArray, index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.text.this') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        formArray.removeAt(index);
        if (formType == 'ChargeOffReasonExpense') {
          this.allowAddChargeOffReasonExpense = formArray.value.length < this.chargeOffReasonOptions.length;
        }
        this.setLoanProductAccountingFormDirty();
      }
    });
  }

  getData(formType: string, values?: any) {
    switch (formType) {
      case 'PaymentFundSource':
        return {
          title: 'Configure Fund Sources for Payment Channels',
          formfields: this.getPaymentFundSourceFormfields(values)
        };
      case 'FeesIncome':
        return { title: 'Map Fees to Income Accounts', formfields: this.getFeesIncomeFormfields(values) };
      case 'PenaltyIncome':
        return {
          title: 'Map Penalties to Specific Income Accounts',
          formfields: this.getPenaltyIncomeFormfields(values)
        };
      case 'ChargeOffReasonExpense':
        return {
          title: 'Map Charge-off reasons to Expense accounts',
          formfields: this.getChargeOffReasonExpenseFormfields(values)
        };
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

  getChargeOffReasonExpenseFormfields(values?: any) {
    const reasonOptions = this.chargeOffReasonOptions.filter((item: any) => !this.currentFormValues.includes(item.id));
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'chargeOffReasonCodeValueId',
        label: 'Charge-off reason',
        value: values ? values.chargeOffReasonCodeValueId : reasonOptions[0].id,
        options: { label: 'name', value: 'id', data: reasonOptions },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'expenseAccountId',
        label: 'Expense Account',
        value: values ? values.expenseAccountId : this.expenseAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.expenseAccountData },
        required: true,
        order: 2
      })

    ];
    return formfields;
  }

  get isAccountingAccrualBased() {
    const accountingRule = this.loanProductAccountingForm.value.accountingRule;
    return accountingRule === 3 || accountingRule === 4;
  }

  get loanProductAccounting() {
    return this.loanProductAccountingForm.value;
  }

  setDeferredIncomeRecognitionControls() {
    if (this.isAccountingAccrualBased) {
      if (this.deferredIncomeRecognition) {
        if (
          this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization ||
          this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee
        ) {
          this.loanProductAccountingForm.addControl(
            'deferredIncomeLiabilityAccountId',
            new UntypedFormControl('', Validators.required)
          );
        } else {
          this.loanProductAccountingForm.removeControl('deferredIncomeLiabilityAccountId');
        }
        if (this.deferredIncomeRecognition.capitalizedIncome.enableIncomeCapitalization) {
          this.loanProductAccountingForm.addControl(
            'incomeFromCapitalizationAccountId',
            new UntypedFormControl('', Validators.required)
          );
        } else {
          this.loanProductAccountingForm.removeControl('incomeFromCapitalizationAccountId');
        }
        if (this.deferredIncomeRecognition.buyDownFee.enableBuyDownFee) {
          this.loanProductAccountingForm.addControl(
            'buyDownExpenseAccountId',
            new UntypedFormControl('', Validators.required)
          );
          this.loanProductAccountingForm.addControl(
            'incomeFromBuyDownAccountId',
            new UntypedFormControl('', Validators.required)
          );
        } else {
          this.loanProductAccountingForm.removeControl('buyDownExpenseAccountId');
          this.loanProductAccountingForm.removeControl('incomeFromBuyDownAccountId');
        }
      }
    }
  }
}
