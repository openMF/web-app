import { Component } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-warning-dialog',
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class WarningDialogComponent {
  title: string;
  content: string;
  buttonText: string;

  constructor(public dialogRef: MatDialogRef<WarningDialogComponent>) {
    this.title = environment.warningDialog.title;
    this.content = environment.warningDialog.content;
    this.buttonText = environment.warningDialog.buttonText;
  }
}
