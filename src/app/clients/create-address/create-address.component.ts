import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-app-create-address',
  templateUrl: './create-address.component.html',
  styleUrls: ['./create-address.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class CreateAddressComponent implements OnInit {
  id: number = undefined;
  paramsSubscription: Subscription;
  clientAddress: any = undefined;
  value: any = undefined;
  mymodel: any = undefined;
  addressTypeId: any = undefined;
  addressStateId: any = undefined;
  addressCountryId: any = undefined;

  address: any = undefined;

  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') addressForm: NgForm;


  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );
    console.log(this.id);
    this.getClientAddressTemplate();
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

  onSubmit() {
    this.address = {};
    console.log(this.addressTypeId);
    this.address.street = this.addressForm.value.street;
    this.address.addressLine1 = this.addressForm.value.addressLine1;
    this.address.addressLine2 = this.addressForm.value.addressLine2;
    this.address.addressLine3 = this.addressForm.value.addressLine3;
    this.address.city = this.addressForm.value.city;
    this.address.stateProvinceId = this.addressStateId;
    this.address.countryId = this.addressCountryId;
    this.address.postalCode = this.addressForm.value.postalCode;


    this.clientService.postClientAddress(this.id, this.address, this.addressTypeId)
      .subscribe(
        (res => {
          return true;
        })
      );
    this.addressForm.reset();
  }
}


