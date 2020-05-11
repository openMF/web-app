/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'mifosx-next-step-dialog',
  templateUrl: './next-step-dialog.component.html',
  styleUrls: ['./next-step-dialog.component.scss']
})
export class NextStepDialogComponent implements OnInit {

  stepPercentage: number;
  nextStepName: string;
  previousStepName: string;

  constructor(public dialogRef: MatDialogRef<NextStepDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {
      this.stepPercentage = data.stepPercentage;
      this.nextStepName = data.nextStepName;
      this.previousStepName = data.previousStepName;
  }

  ngOnInit() {
  }

}
