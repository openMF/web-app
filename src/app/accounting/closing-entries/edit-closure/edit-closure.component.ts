/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Edit closure component.
 */
@Component({
  selector: 'mifosx-edit-closure',
  templateUrl: './edit-closure.component.html',
  styleUrls: ['./edit-closure.component.scss']
})
export class EditClosureComponent implements OnInit {

  /** Accounting closure form. */
  accountingClosureForm: FormGroup;
  /** GL Account closure. */
  glAccountClosure: any;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the gl account closure data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { glAccountClosure: any }) => {
      this.glAccountClosure = data.glAccountClosure;
    });
  }

  /**
   * Creates and sets accounting closure form.
   */
  ngOnInit() {
    this.createAccountingClosureForm();
    this.setAccountingClosure();
  }

  /**
   * Creates accounting closure form.
   */
  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      'officeId': [{ value: '', disabled: true }, Validators.required],
      'closingDate': [{ value: '', disabled: true }, Validators.required],
      'comments': ['']
    });
  }

  /**
   * Sets accounting closure form.
   */
  setAccountingClosure() {
    this.officeData = [{ id: this.glAccountClosure.officeId, name: this.glAccountClosure.officeName }];
    this.accountingClosureForm.get('officeId').setValue(this.glAccountClosure.officeId);
    this.accountingClosureForm.get('closingDate').setValue(new Date(this.glAccountClosure.closingDate));
    this.accountingClosureForm.get('comments').setValue(this.glAccountClosure.comments);
  }


  /**
   * Submits the accounting closure form and updates accounting closure,
   * if successful redirects to view updated closure.
   */
  submit() {
    this.accountingService.updateAccountingClosure(this.glAccountClosure.id,
      { comments: this.accountingClosureForm.value.comments })
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
      });
  }

}
