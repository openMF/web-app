/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/**
 * Financial activity mappings component.
 */
@Component({
  selector: 'mifosx-financial-activity-mappings',
  templateUrl: './financial-activity-mappings.component.html',
  styleUrls: ['./financial-activity-mappings.component.scss']
})
export class FinancialActivityMappingsComponent implements OnInit {

  /** Financial activity account data. */
  financialActivityAccountData: any;
  /** Columns to be displayed in financial activity mappings table. */
  displayedColumns: string[] = ['financialActivity', 'glAccountName', 'glAccountCode'];
  /** Data source for financial activity mappings table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for financial activity mappings table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for financial activity mappings table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the financial activity accounts data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { financialActivityAccounts: any }) => {
      this.financialActivityAccountData = data.financialActivityAccounts;
    });
  }

  /**
   * Sets the financial activity mappings table.
   */
  ngOnInit() {
    this.setFinancialActivityAccounts();
  }

  /**
   * Initializes the data source, paginator and sorter for financial activity mappings table.
   */
  setFinancialActivityAccounts() {
    this.dataSource = new MatTableDataSource(this.financialActivityAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (financialActivityAccount: any, property: any) => {
      switch (property) {
        case 'financialActivity': return financialActivityAccount.financialActivityData.name;
        case 'glAccountName': return financialActivityAccount.glAccountData.name;
        case 'glAccountCode': return financialActivityAccount.glAccountData.glCode;
        default: return financialActivityAccount[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

}
