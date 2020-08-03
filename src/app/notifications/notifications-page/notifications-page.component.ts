/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/**
 * Notifications Page Component
 */
@Component({
  selector: 'mifosx-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {

  /** Notifications data. */
  notificationsData: any;
  /** Columns to be displayed in notifications table. */
  displayedColumns: string[] = ['notification', 'createdAt'];
  /** Data source for notifications table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for notifications table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for notifications table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the notifications data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { notifications: any }) => {
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
