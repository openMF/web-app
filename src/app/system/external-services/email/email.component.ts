/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * Email Configuration Component.
 */
@Component({
  selector: 'mifosx-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  /** Email configuration data. */
  emailConfigurationData: any;
  /** Columns to be displayed in Email configuration table. */
  displayedColumns: string[] = ['name', 'value'];
  /** Data source for Email configuration table. */
  dataSource: MatTableDataSource<any>;

  /** Sorter for Email configuration table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the Email configuration data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { emailConfiguration: any }) => {
      this.emailConfigurationData = data.emailConfiguration;
    });
  }

  /**
   * Sets the Email Configuration table.
   */
  ngOnInit() {
    this.setEmailConfiguration();
  }

  /**
   * Initializes the data source and sorter for Email configuration table.
   */
  setEmailConfiguration() {
    this.dataSource = new MatTableDataSource(this.emailConfigurationData);
    this.dataSource.sort = this.sort;
  }

}
