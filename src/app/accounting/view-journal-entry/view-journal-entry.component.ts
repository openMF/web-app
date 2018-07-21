import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'mifosx-view-journal-entry',
  templateUrl: './view-journal-entry.component.html',
  styleUrls: ['./view-journal-entry.component.scss']
})
export class ViewJournalEntryComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ViewJournalEntryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
