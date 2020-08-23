/** Angular Imports */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Unassign staff dialog component.
 */
@Component({
  selector: 'mifosx-unassign-staff-dialog',
  templateUrl: './unassign-staff-dialog.component.html',
  styleUrls: ['./unassign-staff-dialog.component.scss']
})
export class UnassignStaffDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<UnassignStaffDialogComponent>) { }

}
