/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/**
 * Custom file upload component based on angular material.
 */
@Component({
  selector: 'mifosx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  /** Name of file. */
  fileName = '';

  constructor() { }

  ngOnInit() {
  }

  /**
   * Uploads a file.
   * @param {any} event The file input change event.
   */
  onFileSelected($event: any) {
    this.fileName = $event.target.files[0].name;
  }

}
