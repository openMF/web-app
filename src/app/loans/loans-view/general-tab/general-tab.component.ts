import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit {

  loanDetails: any;
  status: any;
  loanSummaryColumns: string[] = ['Empty', 'Original', 'Paid', 'Waived', 'Written Off', 'Outstanding', 'Over Due'];
  loanDetailsColumns: string[] = ['Key', 'Value'];
  loanSummaryTableData: {
    'property': string,
    'original': string,
    'paid': string,
    'waived': string,
    'writtenOff': string,
    'outstanding': string,
    'overdue': string
  }[];
  loanDetailsTableData: {
    'key': string,
    'value'?: string
  }[];

  /** Data source for loans summary table. */
  dataSource: MatTableDataSource<any>;
  detailsDataSource: MatTableDataSource<any>;

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any, }) => {
      this.loanDetails = data.loanDetailsData;
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
        'property': 'Principal',
        'original': this.loanDetails.summary.principalDisbursed,
        'paid': this.loanDetails.summary.principalPaid,
        'waived': this.loanDetails.summary.principalWrittenOff,
        'writtenOff': this.loanDetails.summary.principalOutstanding,
        'outstanding': this.loanDetails.summary.principalOutstanding,
        'overdue': this.loanDetails.summary.principalOverdue,

    },
    {
        'property': 'Interest',
        'original': this.loanDetails.summary.interestCharged,
        'paid': this.loanDetails.summary.interestPaid,
        'waived': this.loanDetails.summary.interestWaived,
        'writtenOff': this.loanDetails.summary.interestWrittenOff,
        'outstanding': this.loanDetails.summary.interestOutstanding,
        'overdue': this.loanDetails.summary.interestOverdue,
    },
    {
        'property': 'Fees',
        'original': this.loanDetails.summary.feeChargesCharged,
        'paid': this.loanDetails.summary.feeChargesPaid,
        'waived': this.loanDetails.summary.feeChargesWaived,
        'writtenOff': this.loanDetails.summary.feeChargesWrittenOff,
        'outstanding': this.loanDetails.summary.feeChargesOutstanding,
        'overdue': this.loanDetails.summary.feeChargesOverdue,
    },
    {
        'property': 'Penalties',
        'original': this.loanDetails.summary.penaltyChargesCharged,
        'paid': this.loanDetails.summary.penaltyChargesPaid,
        'waived': this.loanDetails.summary.penaltyChargesWaived,
        'writtenOff': this.loanDetails.summary.penaltyChargesWrittenOff,
        'outstanding': this.loanDetails.summary.penaltyChargesOutstanding,
        'overdue': this.loanDetails.summary.penaltyChargesOverdue,
    },
    {
        'property': 'Total',
        'original': this.loanDetails.summary.totalExpectedRepayment,
        'paid': this.loanDetails.summary.totalRepayment,
        'waived': this.loanDetails.summary.totalWaived,
        'writtenOff': this.loanDetails.summary.totalWrittenOff,
        'outstanding': this.loanDetails.summary.totalOutstanding,
        'overdue': this.loanDetails.summary.totalOverdue,
    }
    ];
    this.dataSource = new MatTableDataSource(this.loanSummaryTableData);
  }

  setloanDetailsTableData() {

    this.loanDetailsTableData = [
      {
        'key': 'Disbursement Date'
      },
      {
        'key': 'Loan Purpose'
      },
      {
        'key': 'Loan Officer'
      },
      {
        'key': 'Currency'
      },
      {
        'key': 'External Id'
      },
      {
        'key': 'Proposed Amount',
        'value': this.loanDetails.proposedPrincipal,
      },
      {
        'key': 'Approved Amount',
        'value': this.loanDetails.approvedPrincipal,
      },
      {
        'key': 'Disburse Amount',
        'value': this.loanDetails.principal,
      },
    ];
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);

  }

  setloanNonDetailsTableData() {
    this.loanDetailsTableData = [
      {
        'key': 'Disbursement Date'
      },
      {
        'key': 'Currency'
      },
      {
        'key': 'Loan Officer'
      },
      {
        'key': 'External Id'
      }
    ];
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);
  }

  showApprovedAmountBasedOnStatus() {
    if (this.status === 'Submitted and pending approval' || this.status === 'Withdrawn by applicant' || this.status === 'Rejected') {
        return false;
    }
    return true;
  }

  showDisbursedAmountBasedOnStatus = function() {
    if (this.status === 'Submitted and pending approval' || this.status === 'Withdrawn by applicant' || this.status === 'Rejected' ||
        this.status === 'Approved') {
        return false;
    }
    return true;
  };
}
