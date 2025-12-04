/** Angular Imports. */
import { Component, OnInit, SecurityContext, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class ErrorDialogComponent {
  dialogRef = inject<MatDialogRef<ErrorDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private sanitizer = inject(DomSanitizer);

  showAsCode = false;
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {unknown} data Provides any data.
   * @param {DomSanitizer} sanitizer Service to sanitize HTML content.
   */
  constructor() {
    const data = this.data;

    // Guard for non-string data to avoid runtime error
    this.showAsCode = typeof data === 'string' && data.startsWith('<pre><code>');
  }

  /**
   * Get display data with proper type safety for template usage.
   * @returns {string} Safe string representation of the data.
   */
  get displayData(): string {
    if (typeof this.data === 'string') {
      return this.data;
    }
    // Convert non-string data to string representation for display
    return this.data != null ? JSON.stringify(this.data) : '';
  }

  /**
   * Get sanitized HTML content for safe rendering.
   * @returns {SafeHtml} Sanitized HTML content.
   */
  get sanitizedData(): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.displayData) || '';
  }
}
