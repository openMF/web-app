/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom services. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Reject Loan component.
 */
@Component({
  selector: 'mifosx-reject-loan',
  templateUrl: './reject-loan.component.html',
  styleUrls: ['./reject-loan.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class RejectLoanComponent implements OnInit {
  /** Loan Id. */
  loanId: any;
  /** Reject Loan form. */
  rejectLoanForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Retrieve data from `Resolver`.
   * @param formBuilder Form Builder.
   * @param router Router.
   * @param route Activated Route.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loanService: LoansService,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setRejectLoanForm();
  }

  /**
   * Set Reject Loan form.
   */
  setRejectLoanForm() {
    this.rejectLoanForm = this.formBuilder.group({
      rejectedOnDate: [
        new Date(),
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submit Reject Loan form.
   */
  submit() {
    const rejectLoanFormData = this.rejectLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRejectedOnDate = this.rejectLoanForm.value.rejectedOnDate;
    if (rejectLoanFormData.rejectedOnDate instanceof Date) {
      rejectLoanFormData.rejectedOnDate = this.dateUtils.formatDate(prevRejectedOnDate, dateFormat);
    }
    const data = {
      ...rejectLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.loanActionButtons(this.loanId, 'reject', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
