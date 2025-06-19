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
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Unassign role dialog component.
 */
@Component({
  selector: 'mifosx-unassign-role-dialog',
  templateUrl: './unassign-role-dialog.component.html',
  styleUrls: ['./unassign-role-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
