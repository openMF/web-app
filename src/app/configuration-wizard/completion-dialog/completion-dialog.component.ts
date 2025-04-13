/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * Completion Dialog Component.
 */
@Component({
  selector: 'mifosx-completion-dialog',
  templateUrl: './completion-dialog.component.html',
  styleUrls: ['./completion-dialog.component.scss']
})
export class CompletionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
