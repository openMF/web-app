/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Continue Setup Dialog Component.
 */
@Component({
  selector: 'mifosx-continue-setup-dialog',
  templateUrl: './continue-setup-dialog.component.html',
  styleUrls: ['./continue-setup-dialog.component.scss']
})
export class ContinueSetupDialogComponent implements OnInit {

  /* Current Step Name*/
  stepName: number;

  /**
   * @param {MatDialogRef<ContinueSetupDialogComponent>} dialogRef MatDialogRef<ContinueSetupDialogComponent>.
   */
  constructor(public dialogRef: MatDialogRef<ContinueSetupDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {
    this.stepName = data.stepName;
  }

  ngOnInit() {
  }

}
