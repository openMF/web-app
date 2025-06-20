/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Notification Configuration Component.
 */
@Component({
  selector: 'mifosx-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
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
    MatRow
  ]
})
export class NotificationComponent implements OnInit {
  /** Notification configuration data. */
  notificationConfigurationData: any;
  /** Columns to be displayed in Notification configuration table. */
  displayedColumns: string[] = [
    'name',
    'value'
  ];
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

  getConfigurationValue(configuration: any): string {
    const value = configuration.value;
    if (configuration.name === 'server_key') {
      return value.replace(value.substr(1, value.length - 3), value.substr(1, value.length - 3).replace(/./g, '*'));
    }
    return value;
  }
}
