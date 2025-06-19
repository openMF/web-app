import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-add-interest-pause',
  templateUrl: './add-interest-pause.component.html',
  styleUrls: ['./add-interest-pause.component.scss'],
  imports: [
    MatCard,
    NgIf,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class AddInterestPauseComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Payment Type Options */
  paymentTypes: any;
  /** Show payment details */
  showPaymentDetails = false;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  startDate = new Date();
  maturityDate: Date | null = null;
  /** Interest Pause Loan Form */
  interestPauseLoanForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the Interest Pause loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maturityDate = new Date(this.dataObject.timeline.expectedMaturityDate);
    this.maxDate = new Date(this.dataObject.timeline.expectedMaturityDate);
    this.startDate = new Date(this.settingsService.businessDate);
    if (this.startDate > this.maxDate) {
      this.startDate = this.maxDate;
    }
    this.createInterestPauseLoanForm();
  }

  /**
   * Creates the Interest Pause loan form.
   */
  createInterestPauseLoanForm() {
    this.interestPauseLoanForm = this.formBuilder.group({
      startDate: [
        this.startDate,
        Validators.required
      ],
      endDate: [
        this.startDate,
        Validators.required
      ]
    });
  }

  /** Submits the Interest Pause form */
  submit() {
    const interestPauseLoanFormData = this.interestPauseLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const startDate: Date = this.interestPauseLoanForm.value.startDate;
    if (interestPauseLoanFormData.startDate instanceof Date) {
      interestPauseLoanFormData.startDate = this.dateUtils.formatDate(startDate, dateFormat);
    }
    const endDate: Date = this.interestPauseLoanForm.value.endDate;
    if (interestPauseLoanFormData.endDate instanceof Date) {
      interestPauseLoanFormData.endDate = this.dateUtils.formatDate(endDate, dateFormat);
    }
    const data = {
      ...interestPauseLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.addInterestPauseToLoan(this.loanId, data).subscribe((response: any) => {
      this.router.navigate(['../../term-variations'], { relativeTo: this.route });
    });
  }
}
