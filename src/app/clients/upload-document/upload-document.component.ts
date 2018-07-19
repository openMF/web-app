import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss']
})
export class UploadDocumentComponent implements OnInit {

  id: number = undefined;
  paramsSubscription: Subscription;

  document: any = undefined;


  filename: any = undefined;
  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') documentForm: NgForm;


  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );
    console.log(this.id);
    // this.getClientIdentifierTemplate(this.id);
  }



  onFileSelected($event: any) {
    this.filename = $event.target.files[0].name;
    console.log(this.filename);
  }

  onSubmit() {
    this.document = {};
    this.document.description = this.documentForm.value.description;
    this.document.name = this.documentForm.value.name;
    this.document.filename = this.filename;
    console.log(this.filename);

    this.clientService.postClientDocument(this.id, this.document)
      .subscribe(
        (res => {
          return true;
        })
      );
    this.documentForm.reset();
  }
}

