import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ClientsService } from '../clients.service';

@Component({
  selector: 'mifosx-create-standing-instruction',
  templateUrl: './create-standing-instruction.component.html',
  styleUrls: ['./create-standing-instruction.component.scss']
})
export class CreateStandingInstructionComponent implements OnInit {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  standingInstructionForm: FormGroup;

  transferTypeData: any;
  priorityData: any;
  statusData: any;
  fromAccountTypeData: any;
  fromAccountData: any;
  destinationData: any;
  toOfficeData: any;
  beneficiaryData: any;
  toAccountTypeData: any;
  toAccountData: any;
  instructionData: any;
  recurrenceTypeData: any;
  recurrenceFrequencyData: any;

  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: {
        transferTypes: any,
        priority: any,
        status: any,
        fromAccountTypes: any,
        fromAccount: any,
        destination: any,
        offices: any,
        beneficiary: any,
        toAccountTypes: any,
        toAccount: any,
        instruction: any,
        recurrenceType: any,
        recurrenceFrequency: any
      }) => {
        this.transferTypeData = data.transferTypes;
        this.priorityData = data.priority;
        this.statusData = data.status;
        this.fromAccountTypeData = data.fromAccountTypes;
        this.fromAccountData = data.fromAccount;
        this.destinationData = data.destination;
        this.toOfficeData = data.offices;
        this.beneficiaryData = data.beneficiary;
        this.toAccountTypeData = data.toAccountTypes;
        this.toAccountData = data.toAccount;
        this.instructionData = data.instruction;
        this.recurrenceTypeData = data.recurrenceType;
        this.recurrenceFrequencyData = data.recurrenceFrequency;
      });
  }

  ngOnInit() {
    this.createStandingInstructionForm();
  }

  createStandingInstructionForm() {
    this.standingInstructionForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'applicant': [''],
      'transferTypeId': ['', Validators.required],
      'priorityId': ['', Validators.required],
      'statusId': ['', Validators.required],
      'fromAccountTypeId': ['', Validators.required],
      'fromAccountId': ['', Validators.required],
      'destinationId': ['', Validators.required],
      'toOfficeId': ['', Validators.required],
      'beneficiaryId': ['', Validators.required],
      'toAccountTypeId': ['', Validators.required],
      'toAccountId': ['', Validators.required],
      'instructionId': ['', Validators.required],
      'validityFromDate': ['', Validators.required],
      'validityToDate': ['', Validators.required],
      'recurrenceTypeId': ['', Validators.required],
      'recurrenceFrequencyId': [''],
      'recurrenceOnMonthDay': ['', Validators.required]
    });
  }

  submit() {
    const standingInstruction = this.standingInstructionForm.value;
    standingInstruction.locale = 'en';
    standingInstruction.dateFormat = 'yyyy-MM-dd';
    if (standingInstruction.validityFromDate instanceof Date) {
      let day = standingInstruction.validityFromDate.getDate();
      let month = standingInstruction.validityFromDate.getMonth() + 1;
      const year = standingInstruction.validityFromDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      standingInstruction.validityFromDate = `${year}-${month}-${day}`;
    }
    if (standingInstruction.validityToDate instanceof Date) {
      let day = standingInstruction.validityToDate.getDate();
      let month = standingInstruction.validityToDate.getMonth() + 1;
      const year = standingInstruction.validityToDate.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      standingInstruction.validityToDate = `${year}-${month}-${day}`;
    }
    if (standingInstruction.recurrenceOnMonthDay instanceof Date) {
      let day = standingInstruction.recurrenceOnMonthDay.getDate();
      let month = standingInstruction.recurrenceOnMonthDay.getMonth() + 1;
      const year = standingInstruction.recurrenceOnMonthDay.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      standingInstruction.recurrenceOnMonthDay = `${year}-${month}-${day}`;
    }
    this.clientsService.createStandingInstruction(standingInstruction).subscribe(response => {
      this.router.navigate(['../clients/createstandinginstruction/id', response.transactionId], { relativeTo: this.route });
    });
  }

}
