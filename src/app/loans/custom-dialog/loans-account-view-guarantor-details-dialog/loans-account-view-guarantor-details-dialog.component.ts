import { Component, OnInit, Inject } from '@angular/core';
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

@Component({
  selector: 'mifosx-loans-account-view-guarantor-details-dialog',
  templateUrl: './loans-account-view-guarantor-details-dialog.component.html',
  styleUrls: ['./loans-account-view-guarantor-details-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    NgIf,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
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
