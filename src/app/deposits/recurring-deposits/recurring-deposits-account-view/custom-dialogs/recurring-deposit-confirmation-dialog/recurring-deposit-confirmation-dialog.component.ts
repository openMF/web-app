import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-recurring-deposit-confirmation-action',
  templateUrl: './recurring-deposit-confirmation-dialog.component.html',
  styleUrls: ['./recurring-deposit-confirmation-dialog.component.scss']
})
export class RecurringDepositConfirmationDialogComponent implements OnInit {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a confirmation for all the recurring deposit actions.
   */
  constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
