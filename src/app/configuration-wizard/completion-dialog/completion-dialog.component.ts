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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Completion Dialog Component.
 */
@Component({
  selector: 'mifosx-completion-dialog',
  templateUrl: './completion-dialog.component.html',
  styleUrls: ['./completion-dialog.component.scss'],
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
export class CompletionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
