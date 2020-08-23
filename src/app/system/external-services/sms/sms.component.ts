/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * SMS Configuration Component.
 */
@Component({
  selector: 'mifosx-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SMSComponent implements OnInit {

  /** SMS configuration data. */
  smsConfigurationData: any;
  /** Columns to be displayed in SMS configuration table. */
  displayedColumns: string[] = ['name', 'value'];
  /** Data source for SMS configuration table. */
  dataSource: MatTableDataSource<any>;

  /** Sorter for SMS configuration table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the SMS configuration data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: {smsConfiguration: any}) => {
      this.smsConfigurationData = data.smsConfiguration;
    });
   }

  /**
   * Sets the SMS Configuration table.
   */
  ngOnInit() {
    this.setSMSConfiguration();
  }

  /**
   * Initializes the data source and sorter for SMS configuration table.
   */
  setSMSConfiguration() {
    this.dataSource = new MatTableDataSource(this.smsConfigurationData);
    this.dataSource.sort = this.sort;
  }

}
