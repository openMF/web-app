import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-app-create-address',
  templateUrl: './create-address.component.html',
  styleUrls: ['./create-address.component.scss']
})
export class CreateAddressComponent implements OnInit {
  id: number = undefined;
  paramsSubscription: Subscription;
  clientAddress: any = undefined;
  value: any = undefined;
  mymodel: any = undefined;
  addressTypeId: any  = undefined;
  addressStateId: any  = undefined;
  addressCountryId: any  = undefined;

  address: any  = undefined;

  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') addressForm: NgForm;


  ngOnInit() {
    this.paramsSubscription = this.route.params
    .subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );
    this.getClientAddressTemplate() ;
  }

  getClientAddressTemplate() {
    this.clientService.getClientAddressTemplate()
    .subscribe(
      (res => {
        this.clientAddress = res;
        console.log(res);
      })
    );
  }

  onSubmit(form: NgForm) {
    //  this.submitted = true;
    this.address = {};
    console.log(this.addressTypeId);
    this.address.street = this.addressForm.value.street;
    this.address.addressLine1 = this.addressForm.value.addressLine1;
    this.address.addressLine2 =  this.addressForm.value.addressLine2;
    this.address.addressLine3 = this.addressForm.value.addressLine3;
    this.address.city =  this.addressForm.value.city;
    this.address.stateProvinceId =  this.addressStateId;
    this.address.postalCode =  this.addressForm.value.postalCode;


    console.log(this.address);
  //  const d = new Date();
  //  this.value = this.noteForm.value.value;
   // this.notes.createdOn =  d;
  /*   console.log(this.noteForm.value.option);
    console.log(this.noteForm.value.value);
    console.log(this.mymodel);
    this.noteForm.reset();
    alert("Thanks for submitting! Data: " + JSON.stringify(this.address)); */

   this.clientService.postClientAddress(this.id, this.address, this.addressTypeId)
      .subscribe(
        (res => {
          
          return true;
        })
      );
    this.addressForm.reset(); 

  }

}

