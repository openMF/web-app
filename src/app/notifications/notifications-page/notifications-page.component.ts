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
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Notifications Page Component
 */
@Component({
  selector: 'mifosx-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    MatNoDataRow,
    MatPaginator
  ]
})
export class NotificationsPageComponent implements OnInit {
  /** Notifications data. */
  notificationsData: any;
  /** Columns to be displayed in notifications table. */
  displayedColumns: string[] = [
    'notification',
    'createdAt'
  ];
  /** Data source for notifications table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Gets router link prefix from notification's objectType attribute
   * Shares, Savings, Deposits, Loans routes inaccessible because of dependency on entity ID.
   */
  routeMap: any = {
    client: '/clients/',
    group: '/groups/',
    loan: '/loans-accounts/',
    center: '/centers/',
    shareAccount: '/shares-accounts/',
    fixedDeposit: '/fixed-deposits-accounts/',
    recurringDepositAccount: '/recurring-deposits-accounts/',
    savingsAccount: '/savings-accounts/',
    shareProduct: '/products/share-products/',
    loanProduct: '/products/loan-products/'
  };

  /** Paginator for notifications table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for notifications table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the notifications data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { notifications: any }) => {
      this.notificationsData = data.notifications.pageItems;
    });
  }

  /**
   * Sets the notifications table.
   */
  ngOnInit() {
    this.setNotifications();
  }

  /**
   * Initializes the data source, paginator and sorter for notifications table.
   */
  setNotifications() {
    this.dataSource = new MatTableDataSource(this.notificationsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
