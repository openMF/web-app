import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-loan-product-terms-step',
  templateUrl: './loan-product-terms-step.component.html',
  styleUrls: ['./loan-product-terms-step.component.scss']
})
export class LoanProductTermsStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;

  loanProductTermsForm: FormGroup;

  valueConditionTypeData: any;
  floatingRateData: any;
  interestRateFrequencyTypeData: any;
  repaymentFrequencyTypeData: any;

  displayedColumns: string[] = ['valueConditionType', 'borrowerCycleNumber', 'minValue', 'defaultValue', 'maxValue', 'actions'];

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog) {
    this.createLoanProductTermsForm();
    this.setConditionalControls();
  }

  ngOnInit() {
    this.valueConditionTypeData = this.loanProductsTemplate.valueConditionTypeOptions;
    this.floatingRateData = this.loanProductsTemplate.floatingRateOptions;
    this.interestRateFrequencyTypeData = this.loanProductsTemplate.interestRateFrequencyTypeOptions;
    this.repaymentFrequencyTypeData = this.loanProductsTemplate.repaymentFrequencyTypeOptions;

    this.loanProductTermsForm.patchValue({
      'minPrincipal': this.loanProductsTemplate.minPrincipal,
      'principal': this.loanProductsTemplate.principal,
      'maxPrincipal': this.loanProductsTemplate.maxPrincipal,
      'minNumberOfRepayments': this.loanProductsTemplate.minNumberOfRepayments,
      'numberOfRepayments': this.loanProductsTemplate.numberOfRepayments,
      'maxNumberOfRepayments': this.loanProductsTemplate.maxNumberOfRepayments,
      'isLinkedToFloatingInterestRates': this.loanProductsTemplate.isLinkedToFloatingInterestRates,
      'minInterestRatePerPeriod': this.loanProductsTemplate.minInterestRatePerPeriod,
      'interestRatePerPeriod': this.loanProductsTemplate.interestRatePerPeriod,
      'maxInterestRatePerPeriod': this.loanProductsTemplate.maxInterestRatePerPeriod,
      'interestRateFrequencyType': this.loanProductsTemplate.interestRateFrequencyType.id,
      'floatingRatesId': this.loanProductsTemplate.floatingRateId,
      'interestRateDifferential': this.loanProductsTemplate.interestRateDifferential,
      'isFloatingInterestRateCalculationAllowed': this.loanProductsTemplate.isFloatingInterestRateCalculationAllowed,
      'minDifferentialLendingRate': this.loanProductsTemplate.minDifferentialLendingRate,
      'defaultDifferentialLendingRate': this.loanProductsTemplate.defaultDifferentialLendingRate,
      'maxDifferentialLendingRate': this.loanProductsTemplate.maxDifferentialLendingRate,
      'useBorrowerCycle': this.loanProductsTemplate.useBorrowerCycle,
      'repaymentEvery': this.loanProductsTemplate.repaymentEvery,
      'repaymentFrequencyType': this.loanProductsTemplate.repaymentFrequencyType.id,
      'minimumDaysBetweenDisbursalAndFirstRepayment': this.loanProductsTemplate.minimumDaysBetweenDisbursalAndFirstRepayment
    });

    this.loanProductTermsForm.setControl('principalVariationsForBorrowerCycle',
      this.formBuilder.array(this.loanProductsTemplate.principalVariationsForBorrowerCycle.map((variation: any) => ({ ...variation, valueConditionType: variation.valueConditionType.id }))));
    this.loanProductTermsForm.setControl('numberOfRepaymentVariationsForBorrowerCycle',
      this.formBuilder.array(this.loanProductsTemplate.numberOfRepaymentVariationsForBorrowerCycle.map((variation: any) => ({ ...variation, valueConditionType: variation.valueConditionType.id }))));
    this.loanProductTermsForm.setControl('interestRateVariationsForBorrowerCycle',
      this.formBuilder.array(this.loanProductsTemplate.interestRateVariationsForBorrowerCycle.map((variation: any) => ({ ...variation, valueConditionType: variation.valueConditionType.id }))));
  }

  createLoanProductTermsForm() {
    this.loanProductTermsForm = this.formBuilder.group({
      'useBorrowerCycle': [false],
      'minPrincipal': [''],
      'principal': ['', Validators.required],
      'maxPrincipal': [''],
      'minNumberOfRepayments': [''],
      'numberOfRepayments': ['', Validators.required],
      'maxNumberOfRepayments': [''],
      'isLinkedToFloatingInterestRates': [false],
      'minInterestRatePerPeriod': [''],
      'interestRatePerPeriod': ['', Validators.required],
      'maxInterestRatePerPeriod': [''],
      'interestRateFrequencyType': ['', Validators.required],
      'repaymentEvery': ['', Validators.required],
      'repaymentFrequencyType': ['', Validators.required],
      'minimumDaysBetweenDisbursalAndFirstRepayment': ['']
    });
  }

  setConditionalControls() {
    this.loanProductTermsForm.get('isLinkedToFloatingInterestRates').valueChanges
      .subscribe(isLinkedToFloatingInterestRates => {
        if (isLinkedToFloatingInterestRates) {
          this.loanProductTermsForm.removeControl('minInterestRatePerPeriod');
          this.loanProductTermsForm.removeControl('interestRatePerPeriod');
          this.loanProductTermsForm.removeControl('maxInterestRatePerPeriod');
          this.loanProductTermsForm.removeControl('interestRateFrequencyType');
          this.loanProductTermsForm.addControl('floatingRatesId', new FormControl('', Validators.required));
          this.loanProductTermsForm.addControl('interestRateDifferential', new FormControl('', Validators.required));
          this.loanProductTermsForm.addControl('isFloatingInterestRateCalculationAllowed', new FormControl(false));
          this.loanProductTermsForm.addControl('minDifferentialLendingRate', new FormControl('', Validators.required));
          this.loanProductTermsForm.addControl('defaultDifferentialLendingRate', new FormControl('', Validators.required));
          this.loanProductTermsForm.addControl('maxDifferentialLendingRate', new FormControl('', Validators.required));
        } else {
          this.loanProductTermsForm.addControl('minInterestRatePerPeriod', new FormControl(''));
          this.loanProductTermsForm.addControl('interestRatePerPeriod', new FormControl('', Validators.required));
          this.loanProductTermsForm.addControl('maxInterestRatePerPeriod', new FormControl(''));
          this.loanProductTermsForm.addControl('interestRateFrequencyType', new FormControl(this.interestRateFrequencyTypeData.id, Validators.required));
          this.loanProductTermsForm.removeControl('floatingRatesId');
          this.loanProductTermsForm.removeControl('interestRateDifferential');
          this.loanProductTermsForm.removeControl('isFloatingInterestRateCalculationAllowed');
          this.loanProductTermsForm.removeControl('minDifferentialLendingRate');
          this.loanProductTermsForm.removeControl('defaultDifferentialLendingRate');
          this.loanProductTermsForm.removeControl('maxDifferentialLendingRate');
        }
      });

      this.loanProductTermsForm.get('useBorrowerCycle').valueChanges
        .subscribe(useBorrowerCycle => {
          if (useBorrowerCycle) {
            this.loanProductTermsForm.addControl('principalVariationsForBorrowerCycle', this.formBuilder.array([]));
            this.loanProductTermsForm.addControl('numberOfRepaymentVariationsForBorrowerCycle', this.formBuilder.array([]));
            this.loanProductTermsForm.addControl('interestRateVariationsForBorrowerCycle', this.formBuilder.array([]));
          } else {
            this.loanProductTermsForm.removeControl('principalVariationsForBorrowerCycle');
            this.loanProductTermsForm.removeControl('numberOfRepaymentVariationsForBorrowerCycle');
            this.loanProductTermsForm.removeControl('interestRateVariationsForBorrowerCycle');
          }
        });
  }

  get principalVariationsForBorrowerCycle(): FormArray {
    return this.loanProductTermsForm.get('principalVariationsForBorrowerCycle') as FormArray;
  }

  get numberOfRepaymentVariationsForBorrowerCycle(): FormArray {
    return this.loanProductTermsForm.get('numberOfRepaymentVariationsForBorrowerCycle') as FormArray;
  }

  get interestRateVariationsForBorrowerCycle(): FormArray {
    return this.loanProductTermsForm.get('interestRateVariationsForBorrowerCycle') as FormArray;
  }

  setLoanProductTermsFormDirty() {
    if (this.loanProductTermsForm.pristine) {
      this.loanProductTermsForm.markAsDirty();
    }
  }

  addVariationsForBorrowerCycle(formType: string, variationsForBorrowerCycleFormArray: FormArray) {
    const data = this.getData(formType);
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        variationsForBorrowerCycleFormArray.push(response.data);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  editVariationsForBorrowerCycle(formType: string, variationsForBorrowerCycleFormArray: FormArray, index: number) {
    const data = { ...this.getData(formType, variationsForBorrowerCycleFormArray.at(index).value), layout: { addButtonText: 'Edit' } };
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        variationsForBorrowerCycleFormArray.at(index).patchValue(response.data.value);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  deleteVariationsForBorrowerCycle(variationsForBorrowerCycleFormArray: FormArray, index: number) {
    const deleteVariationsForBorrowerCycleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    deleteVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        variationsForBorrowerCycleFormArray.removeAt(index);
        this.setLoanProductTermsFormDirty();
      }
    });
  }

  getData(formType: string, values?: any) {
    switch (formType) {
      case 'Principal': return { title: 'Principal by loan cycle', formfields: this.getFormfields(values) };
      case 'NumberOfRepayments': return { title: 'Number of repayments by loan cycle', formfields: this.getFormfields(values) };
      case 'NominalInterestRate': return { title: 'Nominal interest rate by loan cycle', formfields: this.getFormfields(values) };
    }
  }

  getFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'valueConditionType',
        label: 'Condition',
        value: values ? values.valueConditionType : this.valueConditionTypeData[0].id,
        options: { label: 'value', value: 'id', data: this.valueConditionTypeData },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'borrowerCycleNumber',
        label: 'Loan Cycle',
        value: values ? values.borrowerCycleNumber : undefined,
        type: 'number',
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'minValue',
        label: 'Minimum',
        value: values ? values.minValue : undefined,
        type: 'number',
        order: 3
      }),
      new InputBase({
        controlName: 'defaultValue',
        label: 'Default',
        value: values ? values.defaultValue : undefined,
        type: 'number',
        required: true,
        order: 4
      }),
      new InputBase({
        controlName: 'maxValue',
        label: 'Maximum',
        value: values ? values.maxValue : undefined,
        type: 'number',
        order: 5
      })
    ];
    return formfields;
  }

  get loanProductTerms() {
    return this.loanProductTermsForm.value;
  }

}
