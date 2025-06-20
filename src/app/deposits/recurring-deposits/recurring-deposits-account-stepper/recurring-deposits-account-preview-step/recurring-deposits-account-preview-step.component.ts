/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDivider } from '@angular/material/divider';
import { NgIf, NgSwitch, TitleCasePipe } from '@angular/common';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FindPipe } from '../../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Recurring Deposit Preview Step
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-preview-step',
  templateUrl: './recurring-deposits-account-preview-step.component.html',
  styleUrls: ['./recurring-deposits-account-preview-step.component.scss'],
  animations: [
    trigger('expandChartSlab', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))])

  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
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
    TitleCasePipe,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class RecurringDepositsAccountPreviewStepComponent implements OnChanges {
  /** Input Data */
  @Input() recurringDepositsAccountTemplate: any;
  @Input() recurringDepositsAccountProductTemplate: any;
  @Input() recurringDepositAccountData: any;
  /** Output the submit action */
  @Output() submitEvent = new EventEmitter();

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'repaymentsEvery'
  ];
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

  constructor() {}

  ngOnChanges() {
    if (this.recurringDepositsAccountProductTemplate) {
      this.interestRateChartData = this.recurringDepositsAccountProductTemplate.accountChart.chartSlabs;
    }
  }
}
