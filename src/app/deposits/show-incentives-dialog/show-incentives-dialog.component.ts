/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * Show incentives dialog component.
 */
@Component({
  selector: 'mifosx-show-incentives-dialog',
  templateUrl: './show-incentives-dialog.component.html',
  styleUrls: ['./show-incentives-dialog.component.scss']
})
export class ShowIncentivesDialogComponent implements OnInit {

  /** Data source for incentives table. */
  incentiveTableDataSource: any;
  /** Columns to be displayed in incentives table. */
  incentiveTableDisplayedColumns: string[] = [
    'attributename',
    'conditionType',
    'attributeValueDesc',
    'incentiveType',
    'amount'
  ];

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides incentive data.
   */
  constructor(
    public dialogRef: MatDialogRef<ShowIncentivesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * Sets incentives table data source value.
   */
  ngOnInit() {
    const incentiveTableDataSource = this.data.incentiveData.incentives;
    this.incentiveTableDataSource = incentiveTableDataSource;
  }
}
