/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { DialogData } from 'app/core/dialogs/dialog-data.model';
import { Dialogs } from 'app/core/dialogs/dialogs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Delete dialog component.
 */
@Component({
  selector: 'mifosx-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
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
export class ConfirmationDialogComponent implements OnInit {
  color: string;
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a deleteContext.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private dialogs: Dialogs,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.setColor();
  }

  setColor() {
    this.color = this.dialogs.setColor(this.data.type);
  }
}
