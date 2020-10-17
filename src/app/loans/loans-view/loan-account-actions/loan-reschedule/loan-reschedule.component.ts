import { Component, OnInit, Input } from '@angular/core';
import { LoansService } from 'app/loans/loans.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { subscribeOn } from 'rxjs/operators';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loan-reschedule',
  templateUrl: './loan-reschedule.component.html',
  styleUrls: ['./loan-reschedule.component.scss']
})
export class LoanRescheduleComponent implements OnInit {

  @Input() dataObject: any;
  loanId: any;
  rescheduleLoanForm: FormGroup;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  codes: any;

  changeRepaymentDate = new FormControl(false);
  introduceGracePeriods = new FormControl(false);
  extendRepaymentPeriod = new FormControl(false);
  adjustinterestrates = new FormControl(false);

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private settingsService: SettingsService) {
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  ngOnInit() {
    this.codes = this.dataObject.rescheduleReasons;
    this.setRescheduleLoanForm();
  }

  setRescheduleLoanForm() {
    this.rescheduleLoanForm = this.formBuilder.group({
      'rescheduleFromDate': [new Date(), Validators.required],
      'rescheduleReasonId': ['', Validators.required],
      'submittedOnDate': [new Date(), Validators.required],
      'rescheduleReasonComment': [''],
      'adjustedDueDate': [''],
      'graceOnPrincipal': [''],
      'graceOnInterest': [''],
      'extraTerms': [''],
      'newInterestRate': ['']
    });

  }

  submit() {
    const rescheduleFromDate = this.rescheduleLoanForm.value.rescheduleFromDate;
    const adjustedDueDate = this.rescheduleLoanForm.value.adjustedDueDate;
    const submittedOnDate = this.rescheduleLoanForm.value.submittedOnDate;
    const dateFormat = this.settingsService.dateFormat;

    this.rescheduleLoanForm.patchValue({
      rescheduleFromDate: this.datePipe.transform(rescheduleFromDate, dateFormat),
      adjustedDueDate: this.datePipe.transform(adjustedDueDate, dateFormat),
      submittedOnDate: this.datePipe.transform(submittedOnDate, dateFormat)
    });
    const rescheduleForm = this.rescheduleLoanForm.value;
    rescheduleForm.locale = this.settingsService.language.code;
    rescheduleForm.dateFormat = dateFormat;
    rescheduleForm.loanId = this.loanId;
    this.loanService.submitRescheduleData(rescheduleForm).subscribe((response: any) => {

      // TODO: needs to be updated
      // mentioned in Community App:
      // location.path('/loans-accounts/' + scope.loanId + '/viewreschedulerequest/'+ data.resourceId);
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
