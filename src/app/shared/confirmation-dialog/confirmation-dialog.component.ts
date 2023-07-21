/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'app/core/dialogs/dialog-data.model';
import { Dialogs } from 'app/core/dialogs/dialogs';

/**
 * Delete dialog component.
 */
@Component({
  selector: 'mifosx-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  color: string;
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a deleteContext.
   */
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        private dialogs: Dialogs,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
    this.setColor();
  }

  setColor() {
    this.color = this.dialogs.setColor(this.data.type);
  }

}
