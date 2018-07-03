import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  filename: string;

  constructor() { }

  ngOnInit() {
  }

  onFileSelected($event: any) {
    this.filename = $event.target.files[0].name;
  }

}
