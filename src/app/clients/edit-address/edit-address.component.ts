import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-app-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {

  id: number = undefined;
  paramsSubscription: Subscription;
  clientAddress: any = undefined;
  clientAddressK: any = undefined;
  value: any = undefined;
  mymodel: any = undefined;
  addressTypeId: number = undefined;
  addressId: number = undefined;
  addressStateId: any = undefined;
  addressCountryId: any = undefined;
  random: any = undefined;

  address: any = undefined;

  form: any = undefined;

  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') addressForm: NgForm;


  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.addressTypeId = +params['addressTypeId'];
          this.addressId = +params['addressId'];

          console.log(this.addressId);
          console.log(this.addressTypeId);
        }
      );
    this.getClientAddressTemplate();
    this.getClientAddress(this.id, this.addressId);
  }

  getClientAddressTemplate() {
    this.clientService.getClientAddressTemplate()
      .subscribe(
        (res => {
          this.clientAddress = res;
          //  console.log(res);
        })
      );
  }

  getClientAddress(id: any, addressId: any) {
    this.clientService.getClientAddress(id)
      .subscribe(
        (res => {
          this.form = {};
          this.clientAddressK = res;
          this.clientAddressK.forEach((item: any) => {
            if (item.addressId === addressId) {
              this.form.street = item.street;
              this.form.addressLine1 = item.addressLine1;
              this.form.addressLine2 = item.addressLine2;
              this.form.addressLine3 = item.addressLine3;
              this.form.city = item.city;
              this.form.stateProvinceId = item.stateProvinceId;
              this.form.countryId = item.countryId;
              this.form.postalCode = item.postalCode;
            }
          });
        })
      );
  }

  onSubmit() {
    this.address = {};
    this.address.addressId = this.addressId;
    this.address.street = this.form.street;
    this.address.addressLine1 = this.form.addressLine1;
    this.address.addressLine2 = this.form.addressLine2;
    this.address.addressLine3 = this.form.addressLine3;
    this.address.city = this.form.city;
    this.address.stateProvinceId = this.form.stateProvinceId;
    this.address.countryId = this.form.countryId;
    this.address.postalCode = this.form.postalCode;
    this.address.locale = 'en';

    console.log(this.address);

    this.clientService.putClientAddress(this.id, this.address, this.addressTypeId)
      .subscribe(
        (res => {
          return true;
        })
      );
  }
}

