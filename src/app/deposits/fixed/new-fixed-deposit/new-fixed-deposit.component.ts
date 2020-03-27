/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatTable, MatTableDataSource } from '@angular/material';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { DepositsService } from '../../deposits.service';

/** Custom Components */
import { ShowIncentivesDialogComponent } from '../../show-incentives-dialog/show-incentives-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { EditChargeDialogComponent } from '../../edit-charge-dialog/edit-charge-dialog.component';

/**
 * New fixed deposit account component.
 */
@Component({
  selector: 'mifosx-new-fixed-deposit',
  templateUrl: './new-fixed-deposit.component.html',
  styleUrls: ['./new-fixed-deposit.component.scss']
})
export class NewFixedDepositComponent implements OnInit {

  // TODO: give options for groups and centers

  /** Fixed deposit application form. */
  fixedDepositApplicationForm: FormGroup;
  /** Products data. */
  products: any[];
  /** Savings accounts data. */
  savingsAccounts: any[];
  /** Client id */
  clientId: string;
  /** Fixed deposit product template data. */
  productTemplateData: any;
  /** Columns to be displayed in interest rate chart table. */
  interestRateChartDisplayedColumns: string[];
  /** Data source for interest rate chart table. */
  interestRateChartDataSource: MatTableDataSource<any>;
  /** Charges table instance. */
  @ViewChild('chargesTable') chargesTableRef: MatTable<Element>;
  /** Columns to be displayed in charges table. */
  chargesTableDisplayedColumns: string[] = [
    'name',
    'type',
    'amount',
    'collectedon',
    'date',
    'repaymentsevery',
    'actions'
  ];

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {DepositsService} depositsService Deposits Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(
    private formBuilder: FormBuilder,
    private depositsService: DepositsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  /**
   * Creates fixed deposit application form.
   * Sets new product and charge data on change.
   * Gets initial fixed deposit template data.
   */
  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.createDepositForm();
    this.onSelectionChange();

    this.route.data.subscribe((data: { templateData: any }) => {
      this.products = data.templateData.productOptions;
      this.savingsAccounts = data.templateData.savingsAccounts;
    });
  }

  /**
   * Creates fixed deposit application form.
   */
  createDepositForm() {
    this.fixedDepositApplicationForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'submittedOnDate': ['', Validators.required],
      'fieldOfficerId': [''],
      'interestCompoundingPeriodType': [''],
      'interestPostingPeriodType': [''],
      'interestCalculationType': [''],
      'interestCalculationDaysInYearType': [''],
      'depositAmount': ['', Validators.required],
      'depositPeriod': ['', Validators.required],
      'depositPeriodFrequencyId': ['', Validators.required],
      'lockinPeriodFrequency': [''],
      'lockinPeriodFrequencyType': [''],
      'transferInterestToSavings': [false],
      'linkAccountId': [''],
      'withHoldTax': [false],
      'chargeId': ['']
    });
  }

  /**
   * Sets interest rate chart table controls.
   */
  setInterestRateChartTableControls() {
    this.interestRateChartDataSource = this.productTemplateData.accountChart.chartSlabs;
    let interestRateChartDisplayedColumns: string[];
    if (this.productTemplateData.accountChart.isPrimaryGroupingByAmount) {
      interestRateChartDisplayedColumns = [
        'amountRange',
        'periodType',
        'periodFromTo',
        'interest',
        'description',
        'incentives'
      ];
    } else {
      interestRateChartDisplayedColumns = [
        'periodType',
        'periodFromTo',
        'amountRange',
        'interest',
        'description',
        'incentives'
      ];
    }
    this.interestRateChartDisplayedColumns = interestRateChartDisplayedColumns;
  }

  /**
   * Calls service for template data on product change.
   * Calls service for charge data on charge change.
   */
  onSelectionChange(): void {
    this.fixedDepositApplicationForm.get('productId').valueChanges.subscribe((productId: any) => {
      const params = {
        clientId: this.clientId,
        productId: productId
      };

      this.depositsService.getFixedDepositAccountsTemplate(params).subscribe((data: any) => {
        this.productTemplateData = data;
        this.productTemplateData.productId = productId;
        const dateFormat = 'dd MMMM yyyy';

        this.fixedDepositApplicationForm.patchValue({
          'interestCompoundingPeriodType': data.interestCompoundingPeriodType.id
            ? data.interestCompoundingPeriodType.id
            : '',
          'interestPostingPeriodType': data.interestPostingPeriodType.id ? data.interestPostingPeriodType.id : '',
          'interestCalculationType': data.interestCalculationType.id ? data.interestCalculationType.id : '',
          'interestCalculationDaysInYearType': data.interestCalculationDaysInYearType.id
            ? data.interestCalculationDaysInYearType.id
            : '',
          'withHoldTax': data.withHoldTax ? data.withHoldTax : false
        });

        for (const i in this.productTemplateData.charges) {
          if (
            this.productTemplateData.charges[i].chargeTimeType.value === 'Annual Fee' &&
            this.productTemplateData.charges[i].feeOnMonthDay
          ) {
            this.productTemplateData.charges[i].feeOnMonthDay.push('2020'); // Note: magic numbers taken from community app code
            this.productTemplateData.charges[i].feeOnMonthDay = new Date(
              this.datePipe.transform(this.productTemplateData.charges[i].feeOnMonthDay, dateFormat)
            );
          }
        }
        this.productTemplateData.chargeOptions = this.productTemplateData.chargeOptions.filter(
          (chargeOption: any) => chargeOption.currency.code === data.currency.code
        );

        if (this.productTemplateData.accountChart.fromDate) {
          const fromDate = this.datePipe.transform(this.productTemplateData.accountChart.fromDate, dateFormat);
          this.productTemplateData.accountChart.fromDate = fromDate;
        }
        if (this.productTemplateData.accountChart.endDate) {
          const endDate = this.datePipe.transform(this.productTemplateData.accountChart.endDate, dateFormat);
          this.productTemplateData.accountChart.endDate = endDate;
        }
        this.setInterestRateChartTableControls();
      });
    });

    this.fixedDepositApplicationForm.get('chargeId').valueChanges.subscribe((chargeId: any) => {
      const dateFormat = 'dd MMMM yyyy';

      this.depositsService.getChargeTemplate(chargeId).subscribe((data: any) => {
        data.chargeId = data.id;
        if (data.chargeTimeType.value === 'Annual Fee') {
          if (data.feeOnMonthDay) {
            data.feeOnMonthDay.push(2020); // Note: magic numbers taken from community app code
            data.feeOnMonthDay = new Date(this.datePipe.transform(data.feeOnMonthDay, dateFormat));
          }
        } else if (data.chargeTimeType.value === 'Monthly Fee') {
          if (data.feeOnMonthDay) {
            data.feeOnMonthDay.push(2020); // Note: magic numbers taken from community app code
            data.feeOnMonthDay = new Date(this.datePipe.transform(data.feeOnMonthDay, dateFormat));
          }
        }
        this.fixedDepositApplicationForm.controls['chargeId'].reset(null, { emitEvent: false });
        this.productTemplateData.charges.push(data);
        this.chargesTableRef.renderRows();
      });
    });
  }

  /**
   * Submits the fixed deposit account form and creates deposit account,
   * if successful redirects to view created account.
   */
  submit() {
    let fdApplicationFormData = this.fixedDepositApplicationForm.value;
    const data = this.productTemplateData;

    if (data.withdrawalFeeType) {
      fdApplicationFormData.withdrawalFeeType = data.withdrawalFeeType.id;
    }
    if (fdApplicationFormData.lockinPeriodFrequency === '') {
      fdApplicationFormData.lockinPeriodFrequency = data.lockinPeriodFrequency;
    }
    if (fdApplicationFormData.lockinPeriodFrequencyType === '' && data.lockinPeriodFrequencyType) {
      fdApplicationFormData.lockinPeriodFrequencyType = data.lockinPeriodFrequencyType.id;
    }

    const interestFreePeriodFrequencyTypeId =
      data.interestFreePeriodFrequencyType === null || data.interestFreePeriodFrequencyType === undefined
        ? ''
        : data.interestFreePeriodFrequencyType.id;
    const preClosurePenalInterestOnTypeId =
      data.preClosurePenalInterestOnType === null || data.preClosurePenalInterestOnType === undefined
        ? ''
        : data.preClosurePenalInterestOnType.id;
    const minDepositTermTypeId =
      data.minDepositTermType === null || data.minDepositTermType === undefined ? '' : data.minDepositTermType.id;
    const maxDepositTermTypeId =
      data.maxDepositTermType === null || data.maxDepositTermType === undefined ? '' : data.maxDepositTermType.id;
    const inMultiplesOfDepositTermTypeId =
      data.inMultiplesOfDepositTermType === null || data.inMultiplesOfDepositTermType === undefined
        ? ''
        : data.inMultiplesOfDepositTermType.id;

    fdApplicationFormData.interestFreePeriodApplicable = data.interestFreePeriodApplicable;
    fdApplicationFormData.preClosurePenalApplicable = data.preClosurePenalApplicable;
    fdApplicationFormData.nominalAnnualInterestRate = data.nominalAnnualInterestRate;
    fdApplicationFormData.minRequiredOpeningBalance = data.minRequiredOpeningBalance;
    fdApplicationFormData.interestFreeFromPeriod = data.interestFreeFromPeriod;
    fdApplicationFormData.interestFreeToPeriod = data.interestFreeToPeriod;
    fdApplicationFormData.interestFreePeriodFrequencyTypeId = interestFreePeriodFrequencyTypeId;
    fdApplicationFormData.preClosurePenalInterest = data.preClosurePenalInterest;
    fdApplicationFormData.preClosurePenalInterestOnTypeId = preClosurePenalInterestOnTypeId;
    fdApplicationFormData.minDepositTerm = data.minDepositTerm;
    fdApplicationFormData.maxDepositTerm = data.maxDepositTerm;
    fdApplicationFormData.minDepositTermTypeId = minDepositTermTypeId;
    fdApplicationFormData.maxDepositTermTypeId = maxDepositTermTypeId;
    fdApplicationFormData.inMultiplesOfDepositTerm = data.inMultiplesOfDepositTerm;
    fdApplicationFormData.inMultiplesOfDepositTermTypeId = inMultiplesOfDepositTermTypeId;

    const dateFormat = 'dd MMMM yyyy';
    const submittedOnDate = this.fixedDepositApplicationForm.controls['submittedOnDate'].value;
    fdApplicationFormData.submittedOnDate = this.datePipe.transform(submittedOnDate, dateFormat);
    fdApplicationFormData.clientId = this.clientId;
    fdApplicationFormData.locale = 'en'; // TODO: Update once language and date settings are setup
    fdApplicationFormData.dateFormat = dateFormat;
    fdApplicationFormData.monthDayFormat = 'dd MMM';
    fdApplicationFormData.chargeId = '';

    fdApplicationFormData.charges = [];
    const charges = this.productTemplateData.charges;
    if (charges.length > 0) {
      for (const i of Object.keys(charges)) {
        const chargeData: any = {
          chargeId: charges[i].chargeId,
          amount: charges[i].amount
        };
        if (charges[i].chargeTimeType.value === 'Annual Fee' || charges[i].chargeTimeType.value === 'Monthly Fee') {
          chargeData.feeOnMonthDay = this.datePipe.transform(charges[i].feeOnMonthDay, 'dd MMMM');
        }
        if (
          charges[i].chargeTimeType.value === 'Specified due date' ||
          charges[i].chargeTimeType.code === 'chargeTimeType.weeklyFee'
        ) {
          chargeData.dueDate = this.datePipe.transform(charges[i].dueDate, dateFormat);
        }
        if (
          charges[i].chargeTimeType.value === 'Monthly Fee' ||
          charges[i].chargeTimeType.code === 'chargeTimeType.weeklyFee'
        ) {
          chargeData.feeInterval = charges[i].feeInterval;
        }
        fdApplicationFormData.charges.push(chargeData);
      }
    }

    fdApplicationFormData.charts = [];
    fdApplicationFormData.charts.push(this.copyChartData());
    fdApplicationFormData = this.removeEmptyValues(fdApplicationFormData);

    this.depositsService.createFixedDepositAccount(fdApplicationFormData).subscribe((response: any) => {
      console.log(response);
      // this.router.navigate(['/viewfixeddepositaccount/' + response.savingsId]); // TODO : Redirect to view account application
    });
  }

  /**
   * Cancels form submission, redirects to client page
   */
  cancel() {
    if (this.clientId) {
      this.router.navigate(['/clients/' + this.clientId + '/general']);
    }
  }

  /**
   * Creates new chart data object.
   * @returns {any} Chart Data Object.
   */
  copyChartData(): any {
    const dateFormat = 'dd MMMM yyyy';
    const chart = this.productTemplateData.accountChart;
    let newChartData = {
      id: chart.id,
      name: chart.name,
      description: chart.description,
      fromDate: this.datePipe.transform(chart.fromDate, dateFormat),
      endDate: this.datePipe.transform(chart.date, dateFormat),
      isPrimaryGroupingByAmount: chart.isPrimaryGroupingByAmount,
      dateFormat: dateFormat,
      locale: 'en', // TODO: Update once language and date settings are setup
      chartSlabs: this.copyChartSlabs(this.productTemplateData.accountChart.chartSlabs),
      isActiveChart: 'true'
    };
    newChartData = this.removeEmptyValues(newChartData);
    return newChartData;
  }

  /**
   * Copy all chart details to a new array.
   * @param {any[]} chartSlabs ChartSlabs array.
   * @returns {any[]} Filtered ChartSlabs array.
   */
  copyChartSlabs(chartSlabs: any): any[] {
    let detailsArray: any[];
    detailsArray = [];
    chartSlabs.map((chartSlab: any) => {
      const chartSlabData = this.copyChartSlab(chartSlab);
      detailsArray.push(chartSlabData);
    });
    return detailsArray;
  }

  /**
   * Create new chart detail object data from chartSlab.
   * @param {any} chartSlab ChartSlab object.
   * @returns {any} Filtered chartslab object.
   */
  copyChartSlab(chartSlab: any): any {
    let newChartSlabData: any = {
      id: chartSlab.id,
      description: chartSlab.description,
      fromPeriod: chartSlab.fromPeriod,
      toPeriod: chartSlab.toPeriod,
      amountRangeFrom: chartSlab.amountRangeFrom,
      amountRangeTo: chartSlab.amountRangeTo,
      annualInterestRate: chartSlab.annualInterestRate,
      locale: 'en', // TODO: Update once language and date settings are setup
      incentives: this.copyIncentives(chartSlab.incentives)
    };
    if (chartSlab.periodType !== undefined) {
      newChartSlabData.periodType = chartSlab.periodType.id;
    }
    newChartSlabData = this.removeEmptyValues(newChartSlabData);
    return newChartSlabData;
  }

  /**
   * Copy all incentives details to a new Array.
   * @param {any[]} incentives Incentives array.
   * @returns {any[]} Filtered incentives array.
   */
  copyIncentives(incentives: any[]): any[] {
    let detailsArray: any[];
    detailsArray = [];
    incentives.map((incentive: any) => {
      const incentiveData = this.copyIncentive(incentive);
      detailsArray.push(incentiveData);
    });
    return detailsArray;
  }

  /**
   * Creates new incentive object.
   * @param {any} incentiveData Incentive Data Object.
   * @returns {any} Filtered incentive data object.
   */
  copyIncentive(incentiveData: any): any {
    let newIncentiveData = {
      id: incentiveData.id,
      entityType: incentiveData.entityType,
      attributeName: incentiveData.attributeName.id,
      conditionType: incentiveData.conditionType.id,
      attributeValue: incentiveData.attributeValue,
      incentiveType: incentiveData.incentiveType.id,
      amount: incentiveData.amount
    };
    newIncentiveData = this.removeEmptyValues(newIncentiveData);
    return newIncentiveData;
  }

  /**
   * Removes empty values from passed object.
   * @param {any} dataObj Data Object.
   * @returns {any} Filtered Data Object.
   */
  removeEmptyValues(dataObj: any): any {
    Object.keys(dataObj).forEach(
      key => (dataObj[key] === null || dataObj[key] === undefined || dataObj[key] === '') && delete dataObj[key]
    );
    return dataObj;
  }

  /**
   * Edit charge object in charges array.
   * @param {number} index Index of the row.
   */
  editCharge(index: number) {
    const chargeData = this.productTemplateData.charges[index];
    const dialogRef = this.dialog.open(EditChargeDialogComponent, {
      width: '50em',
      data: { chargeData: chargeData }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        chargeData.amount = response.data.controls.amount.value;
        if (chargeData.chargeTimeType.value === 'Annual Fee' || chargeData.chargeTimeType.value === 'Monthly Fee') {
          chargeData.feeOnMonthDay = response.data.controls.date.value;
        } else if (
          chargeData.chargeTimeType.value === 'Specified due date' ||
          chargeData.chargeTimeType.code === 'chargeTimeType.weeklyFee'
        ) {
          chargeData.dueDate = response.data.controls.date.value;
        }
        if (
          chargeData.chargeTimeType.value === 'Monthly Fee' ||
          chargeData.chargeTimeType.code === 'chargeTimeType.weeklyFee'
        ) {
          chargeData.feeInterval = response.data.controls.repayments.value;
        }
        this.productTemplateData.charges[index] = chargeData;
        this.chargesTableRef.renderRows();
      }
    });
  }

  /**
   * Deletes charge object from charges array.
   * @param {number} index Index of the row.
   */
  deleteCharge(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productTemplateData.charges.splice(index, 1);
        this.chargesTableRef.renderRows();
      }
    });
  }

  /**
   * View details of selected incentives data.
   * @param {number} index Index of the row.
   */
  showIncentives(index: number) {
    const incentiveData = this.productTemplateData.accountChart.chartSlabs[index];
    this.dialog.open(ShowIncentivesDialogComponent, {
      width: '500em',
      data: { incentiveData: incentiveData }
    });
  }
}
