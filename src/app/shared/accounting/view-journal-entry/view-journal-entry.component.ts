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
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View journal entry dialog component.
 */
@Component({
  selector: 'mifosx-view-journal-entry',
  templateUrl: './view-journal-entry.component.html',
  styleUrls: ['./view-journal-entry.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe
  ]
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
