/** Angular Imports */
import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBar } from '@angular/material/progress-bar';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Next Step Dialog Component.
 */
@Component({
  selector: 'mifosx-next-step-dialog',
  templateUrl: './next-step-dialog.component.html',
  styleUrls: ['./next-step-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatProgressBar,
    MatDialogActions,
    MatDialogClose
  ]
})
export class NextStepDialogComponent {
  dialogRef = inject<MatDialogRef<NextStepDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  /* Step Percentage */
  stepPercentage: number;
  /* Next Step Name */
  nextStepName: string;
  /* Previous Step Name*/
  previousStepName: string;

  /**
   * @param {MatDialogRef<NextStepDialogComponent>} dialogRef MatDialogRef<NextStepDialogComponent>.
   */
  constructor() {
    const data = this.data;

    this.stepPercentage = data.stepPercentage;
    this.nextStepName = data.nextStepName;
    this.previousStepName = data.previousStepName;
  }
}
