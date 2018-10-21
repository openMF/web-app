import { Component, OnInit, ViewChild } from '@angular/core'; /*EDITED*/
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientsService } from 'app/clients/clients.service';
@Component({
  selector: 'mifosx-create-standing-instruction',
  templateUrl: './create-standing-instruction.component.html',
  styleUrls: ['./create-standing-instruction.component.scss']
})
export class CreateStandingInstructionComponent implements OnInit {
  id: number = undefined;
  paramsSubscription: Subscription;
  createStandingInstruction: any = undefined;
  documentTypeId: any = undefined;
  identifier: any = undefined;
  transferId: any = undefined;
  status: any = undefined;

  transferTypes = [{
    id: 1,
    label: 'Account Transfer',
  }, {
    id: 2,
    label: 'Loan Repayment',
  }];


  statusTypes = [{
    id: 1,
    label: 'Active',
  }, {
    id: 2,
    label: 'Disabled',
  }];




  constructor(private route: ActivatedRoute, private clientService: ClientsService) { }
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
          this.createStandingInstruction = res;
          console.log(res);
        })
      );
  }

  onSubmit() {
    this.identifier = {};
    this.identifier.description = this.identifierForm.value.description;
    this.identifier.documentKey = this.identifierForm.value.uniqueid;
    this.identifier.documentSpecificTypeId = this.documentTypeId;
    this.identifier.status = this.status;
    this.identifier.transferId = this.transferId;



    this.clientService.postClientIdentifier(this.id, this.identifier)
      .subscribe(
        (res => {
          return true;
        })
      );
    this.identifierForm.reset();
  }

} /*EDITED*/
