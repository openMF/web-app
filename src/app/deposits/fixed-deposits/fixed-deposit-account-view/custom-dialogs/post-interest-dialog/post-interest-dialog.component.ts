/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * Post interest dialog component.
 */
@Component({
  selector: 'mifosx-post-interest-dialog',
  templateUrl: './post-interest-dialog.component.html',
  styleUrls: ['./post-interest-dialog.component.scss']
})
export class PostInterestDialogComponent {

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   */
  constructor(public dialogRef: MatDialogRef<PostInterestDialogComponent>) { }

}
