import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-warning-dialog',
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class WarningDialogComponent {
  dialogRef = inject<MatDialogRef<WarningDialogComponent>>(MatDialogRef);

  title: string;
  content: string;
  buttonText: string;

  constructor() {
    this.title = environment.warningDialog.title;
    this.content = environment.warningDialog.content;
    this.buttonText = environment.warningDialog.buttonText;
  }
}
