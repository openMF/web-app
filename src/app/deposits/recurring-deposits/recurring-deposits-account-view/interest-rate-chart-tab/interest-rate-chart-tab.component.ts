/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/**
 * Interest Rate Chart Tab Component.
 */
@Component({
  selector: 'mifosx-interest-rate-chart-tab',
  templateUrl: './interest-rate-chart-tab.component.html',
  styleUrls: ['./interest-rate-chart-tab.component.scss']
})
export class InterestRateChartTabComponent implements OnInit {

  /** Interest Rate Chart Data */
  interestRateChartData: any;
  /** Columns to be displayed in interest rate chart table. */
  displayedColumns: string[] = ['period', 'amountRange', 'interest', 'description', 'incentives'];
  /** Data source for interest rate chart table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Retrieves recurring deposits account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { recurringDepositsAccountData: any }) => {
      this.interestRateChartData = data.recurringDepositsAccountData.accountChart.chartSlabs;
    });
  }

  ngOnInit() {
  }

}
