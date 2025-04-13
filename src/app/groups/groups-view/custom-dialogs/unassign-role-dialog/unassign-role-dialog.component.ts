/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * Unassign role dialog component.
 */
@Component({
  selector: 'mifosx-unassign-role-dialog',
  templateUrl: './unassign-role-dialog.component.html',
  styleUrls: ['./unassign-role-dialog.component.scss']
})
export class UnassignRoleDialogComponent {
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data.
   */
  constructor(
    public dialogRef: MatDialogRef<UnassignRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
