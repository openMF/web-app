/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NotificationsService } from '../notifications.service';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationsService = inject(NotificationsService);

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
  constructor() {
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

  /**
   * Navigate to notification object with proper entity context
   * @param {any} notification Notification object
   */
  navigateToNotification(notification: any): void {
    const objectType = notification.objectType;
    const objectId = notification.objectId;

    // For entities that don't require parent context (client, group, center, products)
    if ([
        'client',
        'group',
        'center',
        'shareProduct',
        'loanProduct'
      ].includes(objectType)) {
      this.router.navigate([
        this.routeMap[objectType],
        objectId
      ]);
      return;
    }

    // For account types that require parent entity (client/group) ID
    switch (objectType) {
      case 'loan':
        this.notificationsService.getLoanAccount(objectId).subscribe((account) => {
          if (account && (account.clientId || account.groupId)) {
            const entityType = account.clientId ? 'clients' : 'groups';
            const entityId = account.clientId || account.groupId;
            this.router.navigate([`/${entityType}/${entityId}/loans-accounts/${account.accountId}`]);
          }
        });
        break;

      case 'savingsAccount':
        this.notificationsService.getSavingsAccount(objectId).subscribe((account) => {
          if (account && (account.clientId || account.groupId)) {
            const entityType = account.clientId ? 'clients' : 'groups';
            const entityId = account.clientId || account.groupId;
            this.router.navigate([`/${entityType}/${entityId}/savings-accounts/${account.accountId}`]);
          }
        });
        break;

      case 'fixedDeposit':
        this.notificationsService.getFixedDepositAccount(objectId).subscribe((account) => {
          if (account && (account.clientId || account.groupId)) {
            const entityType = account.clientId ? 'clients' : 'groups';
            const entityId = account.clientId || account.groupId;
            this.router.navigate([`/${entityType}/${entityId}/fixed-deposits-accounts/${account.accountId}`]);
          }
        });
        break;

      case 'recurringDepositAccount':
        this.notificationsService.getRecurringDepositAccount(objectId).subscribe((account) => {
          if (account && (account.clientId || account.groupId)) {
            const entityType = account.clientId ? 'clients' : 'groups';
            const entityId = account.clientId || account.groupId;
            this.router.navigate([`/${entityType}/${entityId}/recurring-deposits-accounts/${account.accountId}`]);
          }
        });
        break;

      case 'shareAccount':
        this.notificationsService.getShareAccount(objectId).subscribe((account) => {
          if (account && (account.clientId || account.groupId)) {
            const entityType = account.clientId ? 'clients' : 'groups';
            const entityId = account.clientId || account.groupId;
            this.router.navigate([`/${entityType}/${entityId}/shares-accounts/${account.accountId}`]);
          }
        });
        break;

      default:
        // Fallback to old behavior for unknown types
        this.router.navigate([
          this.routeMap[objectType],
          objectId
        ]);
    }
  }
}
