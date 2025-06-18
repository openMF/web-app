/** Angular Imports */
import { Component, Inject } from '@angular/core';
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
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Next Step Dialog Component.
 */
@Component({
  selector: 'mifosx-next-step-dialog',
  templateUrl: './next-step-dialog.component.html',
  styleUrls: ['./next-step-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatProgressBar,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class NextStepDialogComponent {
  /* Step Percentage */
  stepPercentage: number;
  /* Next Step Name */
  nextStepName: string;
  /* Previous Step Name*/
  previousStepName: string;

  /**
   * @param {MatDialogRef<NextStepDialogComponent>} dialogRef MatDialogRef<NextStepDialogComponent>.
   */
  constructor(
    public dialogRef: MatDialogRef<NextStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stepPercentage = data.stepPercentage;
    this.nextStepName = data.nextStepName;
    this.previousStepName = data.previousStepName;
  }
}
