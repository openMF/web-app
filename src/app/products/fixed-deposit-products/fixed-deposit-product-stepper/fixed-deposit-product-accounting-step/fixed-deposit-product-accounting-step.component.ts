import { Component, Input, OnInit } from '@angular/core';
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
import { Accounting } from 'app/core/utils/accounting';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatDivider } from '@angular/material/divider';
import { GlAccountSelectorComponent } from '../../../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { MatCheckbox } from '@angular/material/checkbox';
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
  selector: 'mifosx-fixed-deposit-product-accounting-step',
  templateUrl: './fixed-deposit-product-accounting-step.component.html',
  styleUrls: ['./fixed-deposit-product-accounting-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioGroup,
    MatRadioButton,
    MatDivider,
    GlAccountSelectorComponent,
    MatCheckbox,
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
export class FixedDepositProductAccountingStepComponent implements OnInit {
  @Input() fixedDepositProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() fixedDepositProductFormValid: boolean;

  fixedDepositProductAccountingForm: UntypedFormGroup;

  chargeData: any;
  penaltyData: any;
  paymentTypeData: any;
  assetAccountData: any;
  incomeAccountData: any;
  expenseAccountData: any;
  liabilityAccountData: any;

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

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private accounting: Accounting,
    private translateService: TranslateService
  ) {
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
    this.liabilityAccountData =
      this.fixedDepositProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.assignAccountingStepData();
    }
  }

  assignAccountingStepData() {
    this.fixedDepositProductAccountingForm.patchValue({
      accountingRule: this.fixedDepositProductsTemplate.accountingRule.id
    });
    if (this.isCashOrAccrualAccounting()) {
      this.fixedDepositProductAccountingForm.patchValue({
        savingsReferenceAccountId: this.fixedDepositProductsTemplate.accountingMappings.savingsReferenceAccount.id,
        savingsControlAccountId: this.fixedDepositProductsTemplate.accountingMappings.savingsControlAccount.id,
        transfersInSuspenseAccountId:
          this.fixedDepositProductsTemplate.accountingMappings.transfersInSuspenseAccount.id,
        incomeFromFeeAccountId: this.fixedDepositProductsTemplate.accountingMappings.incomeFromFeeAccount.id,
        incomeFromPenaltyAccountId: this.fixedDepositProductsTemplate.accountingMappings.incomeFromPenaltyAccount.id,
        interestOnSavingsAccountId: this.fixedDepositProductsTemplate.accountingMappings.interestOnSavingsAccount.id
      });

      if (this.isAccrualAccounting()) {
        this.fixedDepositProductAccountingForm.patchValue({
          feesReceivableAccountId: this.fixedDepositProductsTemplate.accountingMappings.feeReceivableAccount.id,
          penaltiesReceivableAccountId:
            this.fixedDepositProductsTemplate.accountingMappings.penaltyReceivableAccount.id,
          interestPayableAccountId: this.fixedDepositProductsTemplate.accountingMappings.interestPayableAccount.id
        });
      }

      if (
        this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings ||
        this.fixedDepositProductsTemplate.feeToIncomeAccountMappings ||
        this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings
      ) {
        this.fixedDepositProductAccountingForm.patchValue({
          advancedAccountingRules: true
        });
      }
      if (this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings) {
        this.fixedDepositProductsTemplate.paymentChannelToFundSourceMappings.forEach(
          (paymentChannelToFundSourceMapping: any) => {
            const paymentChannelToFundSourceMappingData = this.formBuilder.group({
              paymentTypeId: [
                paymentChannelToFundSourceMapping.paymentType.id,
                Validators.required
              ],
              fundSourceAccountId: [
                paymentChannelToFundSourceMapping.fundSourceAccount.id,
                Validators.required
              ]
            });
            const formArray = this.fixedDepositProductAccountingForm.controls[
              'paymentChannelToFundSourceMappings'
            ] as UntypedFormArray;
            formArray.push(paymentChannelToFundSourceMappingData);
          }
        );
      }
      if (this.fixedDepositProductsTemplate.feeToIncomeAccountMappings) {
        this.fixedDepositProductsTemplate.feeToIncomeAccountMappings.forEach((feeToIncomeAccountMapping: any) => {
          const feeToIncomeAccountMappingData = this.formBuilder.group({
            chargeId: [
              feeToIncomeAccountMapping.charge.id,
              Validators.required
            ],
            incomeAccountId: [
              feeToIncomeAccountMapping.incomeAccount.id,
              Validators.required
            ]
          });
          const formArray = this.fixedDepositProductAccountingForm.controls[
            'feeToIncomeAccountMappings'
          ] as UntypedFormArray;
          formArray.push(feeToIncomeAccountMappingData);
        });
      }
      if (this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings) {
        this.fixedDepositProductsTemplate.penaltyToIncomeAccountMappings.forEach(
          (penaltyToIncomeAccountMapping: any) => {
            const penaltyToIncomeAccountMappingData = this.formBuilder.group({
              chargeId: [
                penaltyToIncomeAccountMapping.charge.id,
                Validators.required
              ],
              incomeAccountId: [
                penaltyToIncomeAccountMapping.incomeAccount.id,
                Validators.required
              ]
            });
            const formArray = this.fixedDepositProductAccountingForm.controls[
              'penaltyToIncomeAccountMappings'
            ] as UntypedFormArray;
            formArray.push(penaltyToIncomeAccountMappingData);
          }
        );
      }
    }
  }

  createfixedDepositProductAccountingForm() {
    this.fixedDepositProductAccountingForm = this.formBuilder.group({
      accountingRule: [1]
    });
  }

  existCharges(): boolean {
    return this.chargeData.length > 0;
  }

  setConditionalControls() {
    this.fixedDepositProductAccountingForm.get('accountingRule').valueChanges.subscribe((accountingRule: any) => {
      if (accountingRule === 2 || accountingRule === 3) {
        this.fixedDepositProductAccountingForm.addControl(
          'savingsReferenceAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl(
          'savingsControlAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl(
          'transfersInSuspenseAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl(
          'interestOnSavingsAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl(
          'incomeFromFeeAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl(
          'incomeFromPenaltyAccountId',
          new UntypedFormControl('', Validators.required)
        );
        this.fixedDepositProductAccountingForm.addControl('advancedAccountingRules', new UntypedFormControl(false));

        if (accountingRule === 3) {
          this.fixedDepositProductAccountingForm.addControl(
            'feesReceivableAccountId',
            new UntypedFormControl('', Validators.required)
          );
          this.fixedDepositProductAccountingForm.addControl(
            'penaltiesReceivableAccountId',
            new UntypedFormControl('', Validators.required)
          );
          this.fixedDepositProductAccountingForm.addControl(
            'interestPayableAccountId',
            new UntypedFormControl('', Validators.required)
          );
        }

        this.fixedDepositProductAccountingForm
          .get('advancedAccountingRules')
          .valueChanges.subscribe((advancedAccountingRules: boolean) => {
            if (advancedAccountingRules) {
              this.fixedDepositProductAccountingForm.addControl(
                'paymentChannelToFundSourceMappings',
                this.formBuilder.array([])
              );
              this.fixedDepositProductAccountingForm.addControl(
                'feeToIncomeAccountMappings',
                this.formBuilder.array([])
              );
              this.fixedDepositProductAccountingForm.addControl(
                'penaltyToIncomeAccountMappings',
                this.formBuilder.array([])
              );
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
        this.fixedDepositProductAccountingForm.removeControl('feesReceivableAccountId');
        this.fixedDepositProductAccountingForm.removeControl('penaltiesReceivableAccountId');
        this.fixedDepositProductAccountingForm.removeControl('interestPayableAccountId');
      }
    });
  }

  get paymentChannelToFundSourceMappings(): UntypedFormArray {
    return this.fixedDepositProductAccountingForm.get('paymentChannelToFundSourceMappings') as UntypedFormArray;
  }

  get feeToIncomeAccountMappings(): UntypedFormArray {
    return this.fixedDepositProductAccountingForm.get('feeToIncomeAccountMappings') as UntypedFormArray;
  }

  get penaltyToIncomeAccountMappings(): UntypedFormArray {
    return this.fixedDepositProductAccountingForm.get('penaltyToIncomeAccountMappings') as UntypedFormArray;
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
      data: { deleteContext: this.translateService.instant('labels.text.this') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        formArray.removeAt(index);
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

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccountingRuleId(this.fixedDepositProductAccountingForm.value.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccountingRuleId(this.fixedDepositProductAccountingForm.value.accountingRule);
  }
}
