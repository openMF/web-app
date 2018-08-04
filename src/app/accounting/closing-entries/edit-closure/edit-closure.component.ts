import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-edit-closure',
  templateUrl: './edit-closure.component.html',
  styleUrls: ['./edit-closure.component.scss']
})
export class EditClosureComponent implements OnInit {

  // TODO: Update once language and date settings are setup

  accountingClosureForm: FormGroup;
  accountingClosureId: number;
  accountingClosure: any;
  officeData: any;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.accountingClosureId = Number(this.route.snapshot.paramMap.get('id'));
    this.createAccountingClosureForm();
    this.getAccountingClosure();
    this.getOffices();
  }

  getAccountingClosure() {
    this.accountingService.getAccountingClosure(this.accountingClosureId)
      .subscribe((accountingClosure: any) => {
        this.accountingClosure = accountingClosure;
        this.accountingClosureForm.get('officeId').setValue(this.accountingClosure.officeId);
        this.accountingClosureForm.get('closingDate').setValue(new Date());
        this.accountingClosureForm.get('comments').setValue(this.accountingClosure.comments);
      });
  }

  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      'officeId': [{ value: '', disabled: true }, Validators.required],
      'closingDate': [{ value: '', disabled: true }, Validators.required],
      'comments': ['']
    });
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
    });
  }

  submit() {
    this.accountingService.updateAccountingClosure(this.accountingClosureId, { comments: this.accountingClosureForm.value.comments })
      .subscribe((response: any) => {
        this.router.navigate(['/accounting/closing-entries/view', response.resourceId]);
      });
  }

}
