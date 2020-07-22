/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
/**
 * Write Off component.
 */
@Component({
  selector: 'mifosx-write-off-page',
  templateUrl: './write-off-page.component.html',
  styleUrls: ['./write-off-page.component.scss']
})
export class WriteOffPageComponent implements OnInit {

  @Input() dataObject: any;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /** Write Off form. */
  writeOffForm: FormGroup;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {LoansService} loanService Loan Service.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private loanService: LoansService,
              private datePipe: DatePipe,
              private router: Router) { }

  ngOnInit() {
    this.setWriteOffForm();
  }

  /**
   * Set Write Off form.
   */
  setWriteOffForm() {
    this.writeOffForm = this.formBuilder.group({
      'transactionDate': [this.dataObject.date && new Date(this.dataObject.date), Validators.required],
      'amount': [{value: this.dataObject.amount, disabled: true}],
      'note': ['']
    });
  }

  /**
   * Submits write off form.
   */
  submit() {
    const transactionDate = this.writeOffForm.value.transactionDate;
    const dateFormat = 'dd MMMM yyyy';
    this.writeOffForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const loanId = this.route.parent.snapshot.params['loanId'];
    const writeOffForm = this.writeOffForm.value;
    delete writeOffForm.amount;
    writeOffForm.locale = 'en';
    writeOffForm.dateFormat = dateFormat;
    this.loanService.submitLoanActionButton(loanId, writeOffForm, 'writeoff').subscribe((response: any) => {
      this.router.navigate(['../../../general'], {relativeTo: this.route});
    });
  }

}
