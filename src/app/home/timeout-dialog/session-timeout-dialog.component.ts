import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'mifosx-session-timeout-dialog',
  templateUrl: './session-timeout-dialog.component.html',
  styleUrls: ['./session-timeout-dialog.component.scss']
})
export class SessionTimeoutDialogComponent {
  constructor(public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {}
}
