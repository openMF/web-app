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
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * SMS Configuration Component.
 */
@Component({
  selector: 'mifosx-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss'],
  imports: [
    MatButton,
    RouterLink,
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
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class SMSComponent implements OnInit {
  /** SMS configuration data. */
  smsConfigurationData: any;
  /** Columns to be displayed in SMS configuration table. */
  displayedColumns: string[] = [
    'name',
    'value'
  ];
  /** Data source for SMS configuration table. */
  dataSource: MatTableDataSource<any>;

  /** Sorter for SMS configuration table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the SMS configuration data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { smsConfiguration: any }) => {
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
