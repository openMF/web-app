import { Component, OnInit, ViewEncapsulation, ViewChild  } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-create-standing-instruction',
  templateUrl: './create-standing-instruction.component.html',
  styleUrls: ['./create-standing-instruction.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class CreateStandingInstructionComponent implements OnInit {
  id: number = undefined;
  paramsSubscription: Subscription;
  clientInstruction: any = undefined;
  mymodel: any = undefined;
  value: any = undefined;
  transferType: any = undefined;
  instructionPriorityId: any = undefined;
  fromAccountTypeId: any = undefined;
  fromAccountId: any = undefined;
  destinationId: any = undefined;
  officeId: any = undefined;
  beneficiaryId: any = undefined;
  toAccountTypeId: any = undefined;
  toAccountId: any = undefined;
  standingInstructionTypeId: any = undefined;
  recurrenceFrequencyId: any = undefined;
  name: any = undefined;
  account: any = undefined;
  applicant: any = undefined;
  validityFrom: any = undefined;
  validityTo: any = undefined;
  onMonthDay: any = undefined;
  amount: any = undefined;


  identifier: any = undefined;
  statusTypes = [{
    id: 1,
    label: 'Active'
  }, {
    id: 2,
    label: 'Inactive',
}];



  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  @ViewChild('f') instructionForm: NgForm;

  ngOnInit() {
    this.paramsSubscription = this.route.params
    .subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );
  console.log(this.id);
  this.getStandingInstructionTemplate(this.id);
  }

  getStandingInstructionTemplate(id: any) {
    this.clientService.getStandingInstructionTemplate(id)
      .subscribe(
        (res => {
          this.clientInstruction = res;
          console.log(res);
        })
      );
  }

  onSubmit() {
    this.account = {};
    this.account.name = this.name;
    this.account.applicant = this.applicant;
    this.account.amount = this.amount;
    this.account.validityFrom = this.validityFrom;
    this.account.validityTo = this.validityTo;
    this.account.onMonthDay = this.onMonthDay;
    this.account.transferType = this.transferType;
    this.account.instructionPriorityId = this.instructionPriorityId;
    this.account.fromAccountTypeId = this.fromAccountTypeId;
    this.account.fromAccountId = this.fromAccountId;
    this.account.destinationId = this.destinationId;
    this.account.officeId = this.officeId;
    this.account.beneficiaryId = this.beneficiaryId;
    this.account.toAccountTypeId = this.toAccountTypeId
    this.account.toAccountId = this.toAccountId;
    this.account.standingInstructionTypeId = this.standingInstructionTypeId;
    this.account.recurrenceFrequencyId = this.recurrenceFrequencyId;

    this.clientService.postStandingInstruction(this.id, this.account)
      .subscribe(
        (res => {
          return true;
        })
      );



  }
}
