/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, Input, OnChanges, ViewChild, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
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
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgIf, NgSwitch, TitleCasePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Recurring Deposits Account Interest Rate Chart Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-interest-rate-chart-step',
  templateUrl: './recurring-deposits-account-interest-rate-chart-step.component.html',
  styleUrls: ['./recurring-deposits-account-interest-rate-chart-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSlideToggle,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    FaIconComponent,
    NgSwitch,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    MatStepperNext,
    TitleCasePipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecurringDepositsAccountInterestRateChartStepComponent implements OnInit, OnChanges {
  private formBuilder = inject(UntypedFormBuilder);

  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;

  /** Interest Rate Chart Form */
  interestRateChartForm!: UntypedFormGroup;

  /** Interest Rate Chart Data */
  interestRateChartData: any = [];
  /** Columns to be displayed in interest rate chart table. */
  chartSlabsDisplayedColumns: any[] = [
    'period',
    'amountRange',
    'interest',
    'description',
    'actions'
  ];
  /** Columns to be displayed in incentives sub-table. */
  incentivesDisplayedColumns: string[] = [
    'entityType',
    'attributeName',
    'conditionType',
    'attributeValue',
    'incentiveType',
    'amount'
  ];
  /** Additional Column to disblac incentives table  */
  chartSlabsIncentivesDisplayedColumns: string[] = ['incentives'];
  /** Expand Chart Slab Index used in the view */
  expandChartSlabIndex: number;

  @ViewChild('chartsTable', { static: true }) chartsTableRef: MatTable<Element>;

  /** Flag to ensure existing account template values are only patched initially */
  private isInitialAccountDataPatched = false;

  constructor() {
    this.createInterestRateChartForm();
  }

  createInterestRateChartForm() {
    this.interestRateChartForm = this.formBuilder.group({
      isRateChartOverridden: [false],
      nominalAnnualInterestRate: [{ value: '', disabled: true }]
    });

    this.interestRateChartForm.get('isRateChartOverridden')?.valueChanges.subscribe((isOverridden: boolean) => {
      const nominalAnnualInterestRateControl = this.interestRateChartForm.get('nominalAnnualInterestRate');
      if (isOverridden) {
        nominalAnnualInterestRateControl?.enable();
        nominalAnnualInterestRateControl?.setValidators([
          Validators.required,
          Validators.min(0.000001)
        ]);
      } else {
        nominalAnnualInterestRateControl?.disable();
        nominalAnnualInterestRateControl?.clearValidators();
        nominalAnnualInterestRateControl?.reset();
      }
      nominalAnnualInterestRateControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.interestRateChartData = [];
    this.patchFormValues();
  }

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.interestRateChartData = this.recurringDepositsAccountProductTemplate.accountChart?.chartSlabs || [];
      if (this.chartsTableRef) {
        this.chartsTableRef.renderRows();
      }
    }
    this.patchFormValues();
  }

  private patchFormValues() {
    if (this.isInitialAccountDataPatched || this.interestRateChartForm.get('isRateChartOverridden')?.dirty) {
      return;
    }
    if (this.recurringDepositsAccountTemplate?.id) {
      this.isInitialAccountDataPatched = true;
      if (this.recurringDepositsAccountTemplate.isRateChartOverridden) {
        this.interestRateChartForm.get('isRateChartOverridden')?.setValue(true);
        this.interestRateChartForm
          .get('nominalAnnualInterestRate')
          ?.setValue(this.recurringDepositsAccountTemplate.nominalAnnualInterestRate);
      }
    }
  }

  /**
   * Returns interest rate chart form values for payload.
   */
  get interestRateChart() {
    const isRateChartOverridden = this.interestRateChartForm.get('isRateChartOverridden')?.value || false;
    const nominalAnnualInterestRate = this.interestRateChartForm.get('nominalAnnualInterestRate')?.value;
    return {
      isRateChartOverridden,
      ...(isRateChartOverridden &&
      nominalAnnualInterestRate !== null &&
      nominalAnnualInterestRate !== undefined &&
      nominalAnnualInterestRate !== ''
        ? { nominalAnnualInterestRate }
        : {})
    };
  }
}
