/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * Disable dialog component.
 */
@Component({
  selector: 'mifosx-disable-dialog',
  templateUrl: './disable-dialog.component.html',
  styleUrls: ['./disable-dialog.component.scss']
})
export class DisableDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a disableContext.
   */
  constructor(
    public dialogRef: MatDialogRef<DisableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
