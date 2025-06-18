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
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

/**
 * View journal entry dialog component.
 */
@Component({
  selector: 'mifosx-view-journal-entry',
  templateUrl: './view-journal-entry.component.html',
  styleUrls: ['./view-journal-entry.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    NgIf,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe,
    NgxTranslatePipe
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
