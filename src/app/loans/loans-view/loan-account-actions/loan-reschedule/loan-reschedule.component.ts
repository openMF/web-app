import { Component, OnInit, Input } from '@angular/core';
import { LoansService } from 'app/loans/loans.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: 'mifosx-loan-reschedule',
  templateUrl: './loan-reschedule.component.html',
  styleUrls: ['./loan-reschedule.component.scss']
})
export class LoanRescheduleComponent implements OnInit {

  @Input() dataObject: any;
  loanId: any;
  rescheduleLoanForm: UntypedFormGroup;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  codes: any;

  changeRepaymentDate = new UntypedFormControl(false);
  introduceGracePeriods = new UntypedFormControl(false);
  extendRepaymentPeriod = new UntypedFormControl(false);
  adjustinterestrates = new UntypedFormControl(false);

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
      this.loanId = this.route.snapshot.params['loanId'];
    }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const rescheduleLoanFormData = this.rescheduleLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRescheduleFromDate = this.rescheduleLoanForm.value.rescheduleFromDate;
    const prevAdjustedDueDate = this.rescheduleLoanForm.value.adjustedDueDate;
    const prevSubmittedOnDate = this.rescheduleLoanForm.value.submittedOnDate;
    if (prevRescheduleFromDate instanceof Date) {
      rescheduleLoanFormData.rescheduleFromDate = this.dateUtils.formatDate(prevRescheduleFromDate, dateFormat);
    }
    if (prevAdjustedDueDate instanceof Date) {
      rescheduleLoanFormData.adjustedDueDate = this.dateUtils.formatDate(prevAdjustedDueDate, dateFormat);
    }
    if (prevSubmittedOnDate instanceof Date) {
      rescheduleLoanFormData.submittedOnDate = this.dateUtils.formatDate(prevSubmittedOnDate, dateFormat);
    }
    const data = {
      ...rescheduleLoanFormData,
      dateFormat,
      locale
    };
    data.loanId = this.loanId;
    this.loanService.submitRescheduleData(data).subscribe((response: any) => {

      // TODO: needs to be updated
      // mentioned in Community App:
      // location.path('/loans-accounts/' + scope.loanId + '/viewreschedulerequest/'+ data.resourceId);
        this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
