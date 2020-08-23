/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/**
 * Dividends Tab Component.
 */
@Component({
  selector: 'mifosx-dividends-tab',
  templateUrl: './dividends-tab.component.html',
  styleUrls: ['./dividends-tab.component.scss']
})
export class DividendsTabComponent implements OnInit {

  /** Shares Account Data */
  shareAccountData: any;
  /** Dividends Data */
  dividendsData: any;
  /** Data source for dividends table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in dividends table. */
  displayedColumns: string[] = [
    'transactionDate',
    'amount',
    'transactionReference',
    'status'
  ];

  /**
   * Retrieves shares account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { sharesAccountData: any }) => {
      this.shareAccountData = data.sharesAccountData;
      this.dividendsData = this.shareAccountData.dividends;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.dividendsData);
  }

}
