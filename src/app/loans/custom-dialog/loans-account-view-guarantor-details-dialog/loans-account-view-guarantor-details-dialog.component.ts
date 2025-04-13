import { Component, OnInit, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

@Component({
  selector: 'mifosx-loans-account-view-guarantor-details-dialog',
  templateUrl: './loans-account-view-guarantor-details-dialog.component.html',
  styleUrls: ['./loans-account-view-guarantor-details-dialog.component.scss']
})
export class LoansAccountViewGuarantorDetailsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<LoansAccountViewGuarantorDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('400px');
  }
}
