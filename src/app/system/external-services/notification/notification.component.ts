/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * Notification Configuration Component.
 */
@Component({
  selector: 'mifosx-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  /** Notification configuration data. */
  notificationConfigurationData: any;
  /** Columns to be displayed in Notification configuration table. */
  displayedColumns: string[] = ['name', 'value'];
  /** Data source for Notification configuration table. */
  dataSource: MatTableDataSource<any>;

  /** Sorter for Notification configuration table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the Notification configuration data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { notificationConfiguration: any }) => {
      this.notificationConfigurationData = data.notificationConfiguration;
    });
  }

  /**
   * Sets the Notification Configuration table.
   */
  ngOnInit() {
    this.setNotificationConfiguration();
  }

  /**
   * Initializes the data source and sorter for Notification configuration table.
   */
  setNotificationConfiguration() {
    this.dataSource = new MatTableDataSource(this.notificationConfigurationData);
    this.dataSource.sort = this.sort;
  }

}
