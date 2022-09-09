/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Completion Dialog Component.
 */
@Component({
  selector: 'mifosx-completion-dialog',
  templateUrl: './completion-dialog.component.html',
  styleUrls: ['./completion-dialog.component.scss']
})
export class CompletionDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CompletionDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
