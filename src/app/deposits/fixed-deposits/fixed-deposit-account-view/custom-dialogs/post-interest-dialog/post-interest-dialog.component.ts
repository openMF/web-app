/** Angular Imports */
import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Post interest dialog component.
 */
@Component({
  selector: 'mifosx-post-interest-dialog',
  templateUrl: './post-interest-dialog.component.html',
  styleUrls: ['./post-interest-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class PostInterestDialogComponent {
  dialogRef = inject<MatDialogRef<PostInterestDialogComponent>>(MatDialogRef);
}
