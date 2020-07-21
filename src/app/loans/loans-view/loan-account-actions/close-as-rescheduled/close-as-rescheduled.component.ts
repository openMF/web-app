import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-close-as-rescheduled',
  templateUrl: './close-as-rescheduled.component.html',
  styleUrls: ['./close-as-rescheduled.component.scss']
})
export class CloseAsRescheduledComponent implements OnInit {

  @Input() dataObject: any;

  /** Close form. */
  closeLoanForm: FormGroup;
  /** Loan Id */
  loanId: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  /**
   * Creates the close form.
   */
  ngOnInit() {
    this.createCloseForm();
  }

  /**
   * Creates the create close form.
   */
  createCloseForm() {
    this.closeLoanForm = this.formBuilder.group({
      'transactionDate': [new Date(this.dataObject.date) || new Date(), Validators.required],
      'note': []
    });
  }

  /**
   * Submits the close form and creates a close,
   * if successful redirects to view created close.
   */
  submit() {
    const transactionDate = this.closeLoanForm.value.transactionDate;
    const dateFormat = 'yyyy-MM-dd';
    this.closeLoanForm.patchValue({
      transactionDate: this.datePipe.transform(transactionDate, dateFormat)
    });
    const closeForm = this.closeLoanForm.value;
    closeForm.locale = 'en';
    closeForm.dateFormat = dateFormat;
    this.loanService.submitLoanActionButton(this.loanId, closeForm, 'close-rescheduled')
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
