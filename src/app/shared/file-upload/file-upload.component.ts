/** Angular Imports */
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Custom file upload component based on angular material.
 */
@Component({
  selector: 'mifosx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  /** Form field flex dimension */
  @Input() flex: any;
  /** Selected file name */
  fileName: File;

  constructor() { }

  /**
   * Sets the file name.
   * @param {any} event File input change event.
   */
  onFileSelect($event: any) {
    this.fileName = $event.target.files[0].name;
  }

}
