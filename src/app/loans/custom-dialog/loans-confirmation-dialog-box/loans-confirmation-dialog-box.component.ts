import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-loans-confirmation-dialog-box',
  templateUrl: './loans-confirmation-dialog-box.component.html',
  styleUrls: ['./loans-confirmation-dialog-box.component.scss']
})
export class LoansConfirmationDialogBoxComponent implements OnInit {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a confirmation for all the loans account actions.
   */
  constructor(public dialogRef: MatDialogRef<LoansConfirmationDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
