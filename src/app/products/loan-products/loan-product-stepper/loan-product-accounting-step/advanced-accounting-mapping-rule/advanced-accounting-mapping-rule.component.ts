import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';
import { AccountingMappingDTO, AdvancedMappingDTO } from 'app/products/loan-products/models/loan-product.model';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-advanced-accounting-mapping-rule',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    MatRow
  ],
  templateUrl: './advanced-accounting-mapping-rule.component.html',
  styleUrl: './advanced-accounting-mapping-rule.component.scss'
})
export class AdvancedAccountingMappingRuleComponent implements OnInit {
  @Input() formType: string;
  @Input() formArray: UntypedFormArray;
  @Input() textHeading: string;
  @Input() textField: string;
  @Input() allowAddAccountingMapping: boolean = true;
  @Input() accountingMappingOptions: any[] = [];

  currentFormValues: any[] = [];
  @Input() chargeData: any;
  @Input() penaltyData: any;
  @Input() paymentTypeData: any;
  @Input() assetAccountData: any;
  @Input() incomeAccountData: any;
  @Input() expenseAccountData: any;
  @Input() liabilityAccountData: any;
  @Input() incomeAndLiabilityAccountData: any;
  @Input() assetAndLiabilityAccountData: any;

  @Output() formChangeEvent: EventEmitter<AdvancedMappingDTO> = new EventEmitter<AdvancedMappingDTO>();

  tableData: any[] = [];

  tableDisplayedColumns: string[] = [
    'codeValueId',
    'glAccountId',
    'actions'
  ];

  constructor(
    public dialog: MatDialog,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.tableData = this.formArray?.value || [];
    this.sendParentData();
  }

  add() {
    this.currentFormValues = [];
    if (this.formType == 'ChargeOffReasonExpense') {
      this.allowAddAccountingMapping = true;
      this.tableData.forEach((item: any) => this.currentFormValues.push(item.chargeOffReasonCodeValueId));
      if (this.accountingMappingOptions.length == this.currentFormValues.length) {
        this.allowAddAccountingMapping = false;
        return;
      }
    }
    const data = { ...this.getData(this.formType), pristine: false };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const addData: AccountingMappingDTO = {
          value: this.getValueData(response.data.value.valueId),
          glAccount: this.getGlAccountData(response.data.value.glAccountId)
        };
        this.tableData.push(addData);
        this.sendParentData();

        if (this.formType == 'ChargeOffReasonExpense') {
          this.allowAddAccountingMapping = this.tableData.length < this.accountingMappingOptions.length;
        }
      }
    });
  }

  delete(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.text.this') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.tableData.splice(index, 1);
        this.sendParentData();
      }
    });
  }

  sendParentData() {
    const advancedMappingDTO: AdvancedMappingDTO = {
      formType: this.formType,
      values: this.tableData
    };
    this.formChangeEvent.emit(advancedMappingDTO);
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
      case 'BuydownFeeClassificationToIncome':
        return {
          title: 'Buydown Fee classifications to Income accounts',
          formfields: this.getClassificationIncomeFormfields(values)
        };
      case 'CapitalizedIncomeClassificationToIncome':
        return {
          title: 'Capitalized Income classifications to Income accounts',
          formfields: this.getClassificationIncomeFormfields(values)
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
    const reasonOptions = this.accountingMappingOptions.filter(
      (item: any) => !this.currentFormValues.includes(item.id)
    );
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

  getClassificationIncomeFormfields(values?: any) {
    const classificationOptions = this.accountingMappingOptions.filter(
      (item: any) => !this.currentFormValues.includes(item.id)
    );
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'valueId',
        label: 'Classification',
        value: values ? values.chargeOffReasonCodeValueId : classificationOptions[0].id,
        options: { label: 'name', value: 'id', data: classificationOptions },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'glAccountId',
        label: 'Income Account',
        value: values ? values.incomeAccountId : this.incomeAccountData[0].id,
        options: { label: 'name', value: 'id', data: this.incomeAccountData },
        required: true,
        order: 2
      })

    ];
    return formfields;
  }

  getValueData(valueId: number): any {
    return this.accountingMappingOptions.find((i: any) => {
      return i.id === valueId;
    });
  }

  getGlAccountData(valueId: number): any {
    return this.incomeAccountData.find((i: any) => {
      return i.id === valueId;
    });
  }
}
