import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mifosx-session-timeout-dialog',
  templateUrl: './session-timeout-dialog.component.html',
  styleUrls: ['./session-timeout-dialog.component.scss']
})
export class SessionTimeoutDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {
  }

  ngOnInit(): void {
  }

}
