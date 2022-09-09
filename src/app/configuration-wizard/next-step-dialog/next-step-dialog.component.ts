/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Next Step Dialog Component.
 */
@Component({
  selector: 'mifosx-next-step-dialog',
  templateUrl: './next-step-dialog.component.html',
  styleUrls: ['./next-step-dialog.component.scss']
})
export class NextStepDialogComponent implements OnInit {

  /* Step Percentage */
  stepPercentage: number;
  /* Next Step Name */
  nextStepName: string;
  /* Previous Step Name*/
  previousStepName: string;

  /**
   * @param {MatDialogRef<NextStepDialogComponent>} dialogRef MatDialogRef<NextStepDialogComponent>.
   */
  constructor(public dialogRef: MatDialogRef<NextStepDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {
      this.stepPercentage = data.stepPercentage;
      this.nextStepName = data.nextStepName;
      this.previousStepName = data.previousStepName;
  }

  ngOnInit() {
  }

}
