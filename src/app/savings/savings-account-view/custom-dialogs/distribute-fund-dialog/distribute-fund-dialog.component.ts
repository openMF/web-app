import { Component, OnInit } from '@angular/core';
import { CalculateInterestDialogComponent } from '../calculate-interest-dialog/calculate-interest-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mifosx-distribute-fund-dialog',
  templateUrl: './distribute-fund-dialog.component.html',
  styleUrls: ['./distribute-fund-dialog.component.scss']
})
export class DistributeFundDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<DistributeFundDialogComponent>) {}
}
