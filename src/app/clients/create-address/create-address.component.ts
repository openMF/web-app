/** Angular Imports */
import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Client services */
import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-app-create-address',
  templateUrl: './create-address.component.html',
  styleUrls: ['./create-address.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class CreateAddressComponent implements OnInit {
  /** Client id */
  id: number = undefined;
  /** Snapshot user id */
  paramsSubscription: Subscription;
  /** Client address */
  clientAddress: any = undefined;
  /** add new address form. */
  newAddressForm: FormGroup;
  /**
   *
   * @param route active route to snapshot user
   * @param clientService Client service
   * @param formBuilder Form builder
   * @param router for navigation
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private clientService: ClientsService,
              private formBuilder: FormBuilder) {}

  /**
   * Creates the new address form
   */
  ngOnInit() {
    this.createNewAddressForm();
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );
    this.getClientAddressTemplate();
  }

  /**
   * Creates the client address entry form.
   */
  createNewAddressForm() {
    this.newAddressForm = this.formBuilder.group({
      'addressTypeID': ['', Validators.required],
      'street': [''] ,
      'addressLine1': [''],
      'addressLine2': [''],
      'addressLine3': [''],
      'city': [''],
      'stateProvinceId': [''],
      'countryId': ['', Validators.required],
      'postalCode': ['']
    });
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
  /**
   * submit new address form
   * if succesfull navigate to user page
   */
  submit() {
    const newAddress = this.newAddressForm.value;
    this.clientService.postClientAddress(this.id, newAddress, this.newAddressForm.get('addressTypeID'))
      .subscribe(
        (res => {
          this.router.navigate(['../../view/' + this.id]);
        })
      );
  }
}


