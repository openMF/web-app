/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.setColor();
  }

  setColor() {
    switch (this.data.type) {
      case 'Basic':
        this.color = 'primary';
        break;
      case 'Mild':
        this.color = 'accent';
        break;
      case 'Strong':
        this.color = 'warn';
        break;
      default:
        this.color = 'warn';
    }
  }


}
