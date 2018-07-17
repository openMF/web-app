import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientsService } from 'app/clients/clients.service';
@Component({
  selector: 'mifosx-app-create-identity',
  templateUrl: './create-identity.component.html',
  styleUrls: ['./create-identity.component.scss']
})
export class CreateIdentityComponent implements OnInit {
  id: number = undefined;
  paramsSubscription: Subscription;
  clientIdentifierDocument: any = undefined;
  document: any = undefined;
  status: any = undefined;
  value: any = undefined;
  mymodel: any = undefined;
  addressTypeId: any = undefined;
  addressStateId: any = undefined;
  addressCountryId: any = undefined;

  identifier: any = undefined;
  statusTypes = [{
    id: 1,
    label: 'Active'
  }, {
    id: 2,
    label: 'Inactive',
}];
  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') identifierForm: NgForm;


  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );
    console.log(this.id);
    this.getClientIdentifierTemplate(this.id);
  }

  getClientIdentifierTemplate(id: any) {
    this.clientService.getClientIdentifierTemplate(id)
      .subscribe(
        (res => {
          this.clientIdentifierDocument = res;
          console.log(res);
        })
      );
  }

  onSubmit() {
    this.identifier = {};
    this.identifier.description = this.identifierForm.value.description;
    this.identifier.documentKey = this.identifierForm.value.uniqueid;
    this.identifier.documentTypeId = this.document;
    this.identifier.status = this.status;


    this.clientService.postClientIdentifier(this.id, this.identifier)
      .subscribe(
        (res => {
          return true;
        })
      );
    this.identifierForm.reset();
  }

}
