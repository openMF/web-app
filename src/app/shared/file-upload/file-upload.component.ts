/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { NgStyle } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Custom file upload component based on angular material.
 */
@Component({
  selector: 'mifosx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  imports: [
    MatFormField,
    NgStyle,
    MatInput,
    MatButton,
    FaIconComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class FileUploadComponent implements OnInit {
  /** Form field flex dimension */
  @Input() flex: any;
  @Input() acceptFilter: string;

  /** Selected file name */
  fileName: File;

  constructor() {}

  ngOnInit() {
    if (!this.acceptFilter) {
      this.acceptFilter = '.xls,.xlsx,.pdf,.doc,.docx,.png,.jpeg,.jpg';
    }
  }

  /**
   * Sets the file name.
   * @param {any} event File input change event.
   */
  onFileSelect($event: any) {
    this.fileName = $event.target.files[0].name;
  }
}
