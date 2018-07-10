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
  address: any = undefined;
  /* address: {
    id: ''
  }; */
  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') noteForm: NgForm;


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
    console.log(this.address);
  //  const d = new Date();
  //  this.value = this.noteForm.value.value;
   // this.notes.createdOn =  d;
  /*   console.log(this.noteForm.value.option);
    console.log(this.noteForm.value.value);
    console.log(this.mymodel);
    this.noteForm.reset();
    alert("Thanks for submitting! Data: " + JSON.stringify(this.address)); */

   /*  this.clientService.postClientNote(this.id, this.notes)
      .subscribe(
        (res => {
          this.getClientNotes(this.id);
          return true;
        })
      );
    this.noteForm.reset(); */

  }

}

