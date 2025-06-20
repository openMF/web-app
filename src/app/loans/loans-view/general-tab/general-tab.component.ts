import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MatTableDataSource,
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
import { NgIf, CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    ExternalIdentifierComponent,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class GeneralTabComponent implements OnInit {
  /** Currency Code */
  currencyCode: string;
  loanDetails: any;
  status: any;
  loanSummaryColumns: string[] = [
    'Empty',
    'Original',
    'Paid',
    'Waived',
    'Written Off',
    'Outstanding',
    'Over Due'
  ];
  loanDetailsColumns: string[] = [
    'Key',
    'Value'
  ];
  loanSummaryTableData: {
    property: string;
    original: string;
    adjustment: string;
    paid: string;
    waived: string;
    writtenOff: string;
    outstanding: string;
    overdue: string;
  }[];
  loanDetailsTableData: {
    key: string;
    value?: string;
  }[];

  /** Data source for loans summary table. */
  dataSource: MatTableDataSource<any>;
  detailsDataSource: MatTableDataSource<any>;

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
      this.currencyCode = this.loanDetails.currency.code;
      if (this.loanDetails.transactions) {
        this.loanDetails.transactions.some((transaction: any) => {
          if (transaction.type.code === 'loanTransactionType.chargeback') {
            this.loanSummaryColumns = [
              'Empty',
              'Original',
              'Adjustments',
              'Paid',
              'Waived',
              'Written Off',
              'Outstanding',
              'Over Due'
            ];
            return;
          }
        });
      }
    });
  }

  ngOnInit() {
    this.status = this.loanDetails.value;
    if (this.loanDetails.summary) {
      this.setloanSummaryTableData();
      this.setloanDetailsTableData();
    } else {
      this.setloanNonDetailsTableData();
    }
  }

  setloanSummaryTableData() {
    this.loanSummaryTableData = [
      {
        property: 'Principal',
        original: this.loanDetails.summary.totalPrincipal,
        adjustment: this.loanDetails.summary.principalAdjustments || 0,
        paid: this.loanDetails.summary.principalPaid,
        waived: this.loanDetails.summary.principalWaived || 0,
        writtenOff: this.loanDetails.summary.principalWrittenOff,
        outstanding: this.loanDetails.summary.principalOutstanding,
        overdue: this.loanDetails.summary.principalOverdue
      },
      {
        property: 'Interest',
        original: this.loanDetails.summary.interestCharged,
        adjustment: '0',
        paid: this.loanDetails.summary.interestPaid,
        waived: this.loanDetails.summary.interestWaived,
        writtenOff: this.loanDetails.summary.interestWrittenOff,
        outstanding: this.loanDetails.summary.interestOutstanding,
        overdue: this.loanDetails.summary.interestOverdue
      },
      {
        property: 'Fees',
        original: this.loanDetails.summary.feeChargesCharged,
        adjustment: '0',
        paid: this.loanDetails.summary.feeChargesPaid,
        waived: this.loanDetails.summary.feeChargesWaived,
        writtenOff: this.loanDetails.summary.feeChargesWrittenOff,
        outstanding: this.loanDetails.summary.feeChargesOutstanding,
        overdue: this.loanDetails.summary.feeChargesOverdue
      },
      {
        property: 'Penalties',
        original: this.loanDetails.summary.penaltyChargesCharged,
        adjustment: '0',
        paid: this.loanDetails.summary.penaltyChargesPaid,
        waived: this.loanDetails.summary.penaltyChargesWaived,
        writtenOff: this.loanDetails.summary.penaltyChargesWrittenOff,
        outstanding: this.loanDetails.summary.penaltyChargesOutstanding,
        overdue: this.loanDetails.summary.penaltyChargesOverdue
      },
      {
        property: 'Total',
        original: this.loanDetails.summary.totalExpectedRepayment,
        adjustment: this.loanDetails.summary.principalAdjustments || 0,
        paid: this.loanDetails.summary.totalRepayment,
        waived: this.loanDetails.summary.totalWaived,
        writtenOff: this.loanDetails.summary.totalWrittenOff,
        outstanding: this.loanDetails.summary.totalOutstanding,
        overdue: this.loanDetails.summary.totalOverdue
      }
    ];
    this.dataSource = new MatTableDataSource(this.loanSummaryTableData);
  }

  setloanDetailsTableData() {
    this.loanDetailsTableData = [
      {
        key: 'Disbursement Date'
      },
      {
        key: 'Loan Purpose'
      },
      {
        key: 'Loan Officer'
      },
      {
        key: 'Currency'
      },
      {
        key: 'External Id'
      },
      {
        key: 'Proposed Amount',
        value: this.loanDetails.proposedPrincipal
      },
      {
        key: 'Approved Amount',
        value: this.loanDetails.approvedPrincipal
      },
      {
        key: 'Disburse Amount',
        value: this.loanDetails.principal
      }
    ];
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);
  }

  setloanNonDetailsTableData() {
    this.loanDetailsTableData = [
      {
        key: 'Disbursement Date'
      },
      {
        key: 'Currency'
      },
      {
        key: 'Loan Officer'
      },
      {
        key: 'External Id'
      }
    ];
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);
  }

  showApprovedAmountBasedOnStatus() {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected'
    ) {
      return false;
    }
    return true;
  }

  showDisbursedAmountBasedOnStatus = function () {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected' ||
      this.status === 'Approved'
    ) {
      return false;
    }
    return true;
  };
}
