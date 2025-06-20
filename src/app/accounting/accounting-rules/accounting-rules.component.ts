/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Accounting rules component.
 */
@Component({
  selector: 'mifosx-accounting-rules',
  templateUrl: './accounting-rules.component.html',
  styleUrls: ['./accounting-rules.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class AccountingRulesComponent implements OnInit {
  /** Accounting rule data. */
  accountingRuleData: any;
  /** Columns to be displayed in accounting rules table. */
  displayedColumns: string[] = [
    'name',
    'officeName',
    'debitTags',
    'debitAccount',
    'creditTags',
    'creditAccount'
  ];
  /** Data source for accounting rules table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for accounting rules table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for accounting rules table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the accounting rules data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { accountingRules: any }) => {
      this.accountingRuleData = data.accountingRules;
    });
  }

  /**
   * Sets the accounting rules table.
   */
  ngOnInit() {
    this.setAccountingRules();
  }

  /**
   * Initializes the data source, paginator and sorter for accounting rules table.
   */
  setAccountingRules() {
    this.accountingRuleData.forEach((accountingRule: any) => {
      accountingRule.debitTags = accountingRule.debitTags
        ? accountingRule.debitTags.map((debitTag: any) => debitTag.tag.name).join(', ')
        : '';
      accountingRule.creditTags = accountingRule.creditTags
        ? accountingRule.creditTags.map((creditTag: any) => creditTag.tag.name).join(', ')
        : '';
    });
    this.dataSource = new MatTableDataSource(this.accountingRuleData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (accountingRule: any, property: any) => {
      switch (property) {
        case 'debitAccount':
          return accountingRule.debitAccounts[0].name;
        case 'creditAccount':
          return accountingRule.creditAccounts[0].name;
        default:
          return accountingRule[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in accounting rules table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
