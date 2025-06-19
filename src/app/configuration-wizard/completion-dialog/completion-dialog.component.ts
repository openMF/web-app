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
 * Completion Dialog Component.
 */
@Component({
  selector: 'mifosx-completion-dialog',
  templateUrl: './completion-dialog.component.html',
  styleUrls: ['./completion-dialog.component.scss'],
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
export class CompletionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
