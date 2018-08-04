import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-create-closure',
  templateUrl: './create-closure.component.html',
  styleUrls: ['./create-closure.component.scss']
})
export class CreateClosureComponent implements OnInit {

  // TODO: Validations, Hints

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  accountingClosureForm: FormGroup;
  officeData: any;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createAccountingClosureForm();
    this.getOffices();
  }

  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'closingDate': ['', Validators.required],
      'comments': ['']
    });
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
    });
  }

  submit() {
    const accountingClosure = this.accountingClosureForm.value;
    // TODO: Update once language and date settings are setup
    accountingClosure.locale = 'en';
    accountingClosure.dateFormat = 'dd MMMM yyyy';
    accountingClosure.closingDate = '4 August 2018';
    this.accountingService.createAccountingClosure(accountingClosure).subscribe((response: any) => {
      this.router.navigate(['/accounting/closing-entries/view', response.resourceId]);
    });
  }

}
