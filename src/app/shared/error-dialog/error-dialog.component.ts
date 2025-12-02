/** Angular Imports. */
import { Component, OnInit, Inject, SecurityContext } from '@angular/core';
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
  showAsCode = false;
  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {unknown} data Provides any data.
   * @param {DomSanitizer} sanitizer Service to sanitize HTML content.
   */
  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: unknown,
    private sanitizer: DomSanitizer
  ) {
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
