import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DepositProductIncentiveFormDialogComponent } from 'app/products/deposit-product-incentive-form-dialog/deposit-product-incentive-form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

@Component({
  selector: 'mifosx-fixed-deposit-product-interest-rate-chart-step',
  templateUrl: './fixed-deposit-product-interest-rate-chart-step.component.html',
  styleUrls: ['./fixed-deposit-product-interest-rate-chart-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FixedDepositProductInterestRateChartStepComponent implements OnInit {

  @Input() fixedDepositProductsTemplate: any;

  fixedDepositProductInterestRateChartForm: FormGroup;

  periodTypeData: any;
  entityTypeData: any;
  attributeNameData: any;
  conditionTypeData: any;
  genderData: any;
  clientTypeData: any;
  clientClassificationData: any;
  incentiveTypeData: any;

  chartSlabsDisplayedColumns: any[] = [];
  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  incentivesDisplayedColumns: string[] = ['entityType', 'attributeName', 'conditionType', 'attributeValue', 'incentiveType', 'amount', 'actions'];

  minDate = new Date(2000, 0, 1);
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  expandChartSlabIndex: number[] = [];
  chartDetailData: any = [];
  chartsDetail: any[] = [];

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog,
              private datePipe: DatePipe) {
    this.createFixedDepositProductInterestRateChartForm();
  }

  ngOnInit() {
    this.periodTypeData = this.fixedDepositProductsTemplate.chartTemplate.periodTypes;
    this.entityTypeData = this.fixedDepositProductsTemplate.chartTemplate.entityTypeOptions;
    this.attributeNameData = this.fixedDepositProductsTemplate.chartTemplate.attributeNameOptions;
    this.conditionTypeData = this.fixedDepositProductsTemplate.chartTemplate.conditionTypeOptions;
    this.genderData = this.fixedDepositProductsTemplate.chartTemplate.genderOptions;
    this.clientTypeData = this.fixedDepositProductsTemplate.chartTemplate.clientTypeOptions;
    this.clientClassificationData = this.fixedDepositProductsTemplate.chartTemplate.clientClassificationOptions;
    this.incentiveTypeData = this.fixedDepositProductsTemplate.chartTemplate.incentiveTypeOptions;

    if (!(this.fixedDepositProductsTemplate === undefined) && this.fixedDepositProductsTemplate.id) {
      this.assignFormData();
    }
  }

  assignFormData() {
    this.addChart();
    const isChartArray = Array.isArray(this.fixedDepositProductsTemplate.activeChart);
    if (!isChartArray) {
      this.chartDetailData.push(this.fixedDepositProductsTemplate.activeChart);
    } else {
      this.chartDetailData = this.fixedDepositProductsTemplate.activeChart;
    }

    // Build the array of Objects from the retrived value
    this.getChartsDetailsData();

    // Iterates for every chart in charts
    this.charts.controls.forEach((chartDetailControl: FormGroup, i: number) => {

      // Iterate for every chartSlab in chart
      this.chartsDetail[i].chartSlabs.forEach((chartSlabDetail: any, j: number) => {

        const chartSlabInfo = this.formBuilder.group({
          amountRangeFrom: [chartSlabDetail.amountRangeFrom],
          amountRangeTo: [chartSlabDetail.amountRangeTo],
          annualInterestRate: [chartSlabDetail.annualInterestRate, Validators.required],
          description: [chartSlabDetail.description, Validators.required],
          fromPeriod: [chartSlabDetail.fromPeriod, Validators.required],
          toPeriod: [chartSlabDetail.toPeriod],
          periodType: [chartSlabDetail.periodType, Validators.required],
          incentives: this.formBuilder.array([])
        });
        const formArray = chartDetailControl.controls['chartSlabs'] as FormArray;
        formArray.push(chartSlabInfo);

        // Iterate for every slab in chartSlab
        const chartIncentiveControl = chartDetailControl.controls['chartSlabs']['controls'][j];

        // Iterate to input all the incentive for particular chart slab
        this.chartsDetail[i].chartSlabs[j].incentives.forEach((chartIncentiveDetail: any) => {
          const incentiveInfo = this.formBuilder.group({
            amount: [chartIncentiveDetail.amount, Validators.required],
            attributeName: [chartIncentiveDetail.attributeName, Validators.required],
            attribureValue: [chartIncentiveDetail.attribureValue, Validators.required],
            conditionType: [chartIncentiveDetail.conditionType, Validators.required],
            entityType: [chartIncentiveDetail.entityType, Validators.required],
            incentiveType: [chartIncentiveDetail.incentiveType, Validators.required]
          });
          const newFormArray = chartIncentiveControl['controls']['incentives'] as FormArray;
          newFormArray.push(incentiveInfo);
        });

      });

    });
  }

  getChartsDetailsData() {
    this.chartDetailData.forEach((chartData: any) => {
      const chart = {
        endDate: chartData.endDate ? new Date(chartData.endDate) : '',
        fromDate: chartData.fromDate ? new Date(chartData.fromDate) : '',
        isPrimaryGroupingByAmount: chartData.isPrimaryGroupingByAmount,
        name: chartData.name,
        chartSlabs: this.getChartSlabsData(chartData)
      };
      this.chartsDetail.push(chart);
    });
    this.fixedDepositProductInterestRateChartForm.patchValue({
      'charts': this.chartsDetail
    });
  }

  getChartSlabsData(chartData: any) {
    const chartSlabs: any[] = [];
    let chartSlabData: any[] = [];
    const isChartSlabArray = Array.isArray(chartData.chartSlabs);
    if (!isChartSlabArray) {
      chartSlabData.push(chartData.chartSlabs);
    } else {
      chartSlabData = chartData.chartSlabs;
    }

    chartSlabData.forEach((eachChartSlabData: any) => {
      const chartSlab = {
        periodType: eachChartSlabData.periodType.id,
        amountRangeFrom: eachChartSlabData.amountRangeFrom,
        amountRangeTo: eachChartSlabData.amountRangeTo,
        annualInterestRate: eachChartSlabData.annualInterestRate,
        description: eachChartSlabData.description ? eachChartSlabData.description : '',
        fromPeriod: eachChartSlabData.fromPeriod,
        toPeriod: eachChartSlabData.toPeriod,
        incentives: this.getIncentivesData(chartSlabData)
      };
      chartSlabs.push(chartSlab);
    });
    return chartSlabs;
  }

  getIncentivesData(chartSlabData: any) {
    const incentives: any[] = [];
    let incentiveDatas: any[] = [];
    if (chartSlabData.incentives) {
      const isChartIncentiveArray = Array.isArray(chartSlabData.incentives);
      if (!isChartIncentiveArray) {
        incentiveDatas.push(chartSlabData.incentives);
      } else {
        incentiveDatas = chartSlabData.incentives;
      }
      incentiveDatas.forEach((incentiveData: any) => {
        const incentive = {
          amount: incentiveData.amount,
          attributeName: incentiveData.attributeName,
          attributeValue: incentiveData.attributeValue,
          conditionType: incentiveData.conditionType,
          entityType: incentiveData.entityType,
          incentiveType: incentiveData.incentiveType,
        };
        incentives.push(incentive);
      });
    }
    return incentives;
  }

  createFixedDepositProductInterestRateChartForm() {
    this.fixedDepositProductInterestRateChartForm = this.formBuilder.group({
      'charts': this.formBuilder.array([])
    });
  }

  get charts(): FormArray {
    return this.fixedDepositProductInterestRateChartForm.get('charts') as FormArray;
  }

  createChartForm(): FormGroup {
    return this.formBuilder.group({
      'name': [''],
      'description': [''],
      'fromDate': ['', Validators.required],
      'endDate': [''],
      'isPrimaryGroupingByAmount': [false],
      'chartSlabs': this.formBuilder.array([])
    });
  }

  addChart() {
    this.charts.push(this.createChartForm());
    this.setConditionalControls(this.charts.length - 1);
  }

  setConditionalControls(chartIndex: number) {
    this.chartSlabsDisplayedColumns[chartIndex] = ['period', 'amountRange', 'annualInterestRate', 'description', 'actions'];
    this.charts.at(chartIndex).get('isPrimaryGroupingByAmount').valueChanges
      .subscribe((isPrimaryGroupingByAmount: boolean) => {
        this.chartSlabsDisplayedColumns[chartIndex] = isPrimaryGroupingByAmount ? ['amountRange', 'period'] : ['period', 'amountRange'];
        this.chartSlabsDisplayedColumns[chartIndex].push('annualInterestRate', 'description', 'actions');
      });
  }

  getIncentives(chartSlabs: FormArray, chartSlabIndex: number): FormArray {
    return chartSlabs.at(chartSlabIndex).get('incentives') as FormArray;
  }

  addChartSlab(chartSlabs: FormArray) {
    const data = { ...this.getData('Slab') };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        response.data.addControl('incentives', this.formBuilder.array([]));
        chartSlabs.push(response.data);
      }
    });
  }

  addIncentive(incentives: FormArray) {
    const data = { ...this.getData('Incentive'), entityType: this.entityTypeData[0].id };
    const dialogRef = this.dialog.open(DepositProductIncentiveFormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        incentives.push(response.data);
      }
    });
  }

  editChartSlab(chartSlabs: FormArray, chartSlabIndex: number) {
    const data = { ...this.getData('Slab', chartSlabs.at(chartSlabIndex).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        chartSlabs.at(chartSlabIndex).patchValue(response.data.value);
      }
    });
  }

  editIncentive(incentives: FormArray, incentiveIndex: number) {
    const data = { ...this.getData('Incentive', incentives.at(incentiveIndex).value), layout: { addButtonText: 'Edit' } };
    const dialogRef = this.dialog.open(DepositProductIncentiveFormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        incentives.at(incentiveIndex).patchValue(response.data.value);
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
      case 'Slab': return  { title: 'Slab', formfields: this.getSlabFormfields(values) };
      case 'Incentive': return { values, chartTemplate: this.fixedDepositProductsTemplate.chartTemplate };
    }
  }

  getSlabFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'periodType',
        label: 'Period Type',
        value: values ? values.periodType : this.periodTypeData[0].id,
        options: { label: 'value', value: 'id', data: this.periodTypeData },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'fromPeriod',
        label: 'Period From',
        value: values ? values.fromPeriod : undefined,
        type: 'number',
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'toPeriod',
        label: 'Period To',
        value: values ? values.toPeriod : undefined,
        type: 'number',
        order: 3
      }),
      new InputBase({
        controlName: 'amountRangeFrom',
        label: 'Amount Range From',
        value: values ? values.amountRangeFrom : undefined,
        type: 'number',
        order: 4
      }),
      new InputBase({
        controlName: 'amountRangeTo',
        label: 'Amount Range To',
        value: values ? values.amountRangeTo : undefined,
        type: 'number',
        order: 5
      }),
      new InputBase({
        controlName: 'annualInterestRate',
        label: 'Interest',
        value: values ? values.annualInterestRate : undefined,
        type: 'number',
        required: true,
        order: 6
      }),
      new InputBase({
        controlName: 'description',
        label: 'Description',
        value: values ? values.description : undefined,
        required: true,
        order: 7
      })
    ];
    return formfields;
  }

  get fixedDepositProductInterestRateChart() {
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    const locale = 'en';
    const fixedDepositProductInterestRateChart = this.fixedDepositProductInterestRateChartForm.value;
    for (const chart of fixedDepositProductInterestRateChart.charts) {
      chart.dateFormat = dateFormat;
      chart.locale = locale;
      chart.fromDate = this.datePipe.transform(chart.fromDate, dateFormat) || '';
      chart.endDate = this.datePipe.transform(chart.endDate, dateFormat) || '';
      if (chart.endDate === '') {
        delete chart.endDate;
      }
    }
    return fixedDepositProductInterestRateChart;
  }

}
