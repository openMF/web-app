/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * View journal entry dialog component.
 */
@Component({
  selector: 'mifosx-view-journal-entry',
  templateUrl: './view-journal-entry.component.html',
  styleUrls: ['./view-journal-entry.component.scss']
})
export class ViewJournalEntryComponent {
  existsPaymentDetails = false;
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides journal entry.
   */
  constructor(
    public dialogRef: MatDialogRef<ViewJournalEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.existsPaymentDetails =
      data.journalEntry.transactionDetails != null && data.journalEntry.transactionDetails.paymentDetails != null;
  }
}
