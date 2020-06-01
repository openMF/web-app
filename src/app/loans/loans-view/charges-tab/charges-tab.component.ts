/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-charges-tab',
  templateUrl: './charges-tab.component.html',
  styleUrls: ['./charges-tab.component.scss']
})
export class ChargesTabComponent implements OnInit {

  /** Loan Details Data */
  loanDetails: any;
  /** Charges Data */
  chargesData: any;
  /** Status */
  status: any;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = ['name', 'feepenalty', 'paymentdueat', 'dueasof', 'calculationtype', 'due', 'paid', 'waived', 'outstanding', 'actions'];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for charges table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for charges table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { loanDetailsAssociationData: any }) => {
      this.loanDetails = data.loanDetailsAssociationData;
    });
  }


  ngOnInit() {
    this.chargesData = this.loanDetails.charges;
    this.status = this.loanDetails.status.value;
    let actionFlag;
    this.chargesData.forEach((element: any) => {
      if (element.paid || element.waived || element.chargeTimeType.value === 'Disbursement' || this.loanDetails.status.value !== 'Active') {
        actionFlag = true;
      } else {
        actionFlag = false;
      }
      element.actionFlag = actionFlag;
    });
    this.dataSource = new MatTableDataSource(this.chargesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
