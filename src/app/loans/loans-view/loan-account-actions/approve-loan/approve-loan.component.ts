/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Approve Loan component.
 */
@Component({
  selector: 'mifosx-approve-loan',
  templateUrl: './approve-loan.component.html',
  styleUrls: ['./approve-loan.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    InputAmountComponent,
    CdkTextareaAutosize,
    FormatNumberPipe
  ]
})
export class ApproveLoanComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private loanService = inject(LoansService);
  private router = inject(Router);
  private settingsService = inject(SettingsService);

  /** Approve Loan form. */
  approveLoanForm: UntypedFormGroup;
  /** Loan data. */
  loanData: any = new Object();
  /** Association Data */
  associationData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Loan Id */
  loanId: any;
  currency: Currency;

  /**
   * Retrieve data from `Resolver`.
   * @param formBuilder Form Builder.
   * @param route Activated Route.
   * @param dateUtils Date Utils.
   * @param loanService Loan Service.
   * @param router Router.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.loanData = data.actionButtonData;
      this.currency = data.actionButtonData.currency;
    });
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.setApproveLoanForm();
    this.loanService.getApproveAssociationsDetails(this.loanId).subscribe((response: any) => {
      this.associationData = response;
      this.approveLoanForm.patchValue({
        expectedDisbursementDate: new Date(response.timeline.expectedDisbursementDate)
      });
    });

    // Get delinquency data for available disbursement amount with over applied
    this.loanService.getLoanDelinquencyDataForTemplate(this.loanId).subscribe((delinquencyData: any) => {
      // Check if the field is at root level
      if (delinquencyData.availableDisbursementAmountWithOverApplied !== undefined) {
        this.loanData.availableDisbursementAmountWithOverApplied =
          delinquencyData.availableDisbursementAmountWithOverApplied;
      }
      // Also check if it's in delinquent object
      if (delinquencyData.delinquent) {
        this.loanData.delinquent = delinquencyData.delinquent;
      }
    });
  }

  /**
   * Set Approve Loan form.
   */
  setApproveLoanForm() {
    this.approveLoanForm = this.formBuilder.group({
      approvedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      expectedDisbursementDate: [''],
      approvedLoanAmount: [
        this.loanData.approvalAmount,
        Validators.required
      ],
      note: ['']
    });
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const approveLoanFormData = this.approveLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const approvedOnDate = this.approveLoanForm.value.approvedOnDate;
    const expectedDisbursementDate = this.approveLoanForm.value.expectedDisbursementDate;
    if (approveLoanFormData.approvedOnDate instanceof Date) {
      approveLoanFormData.approvedOnDate = this.dateUtils.formatDate(approvedOnDate, dateFormat);
    }
    if (approveLoanFormData.expectedDisbursementDate instanceof Date) {
      approveLoanFormData.expectedDisbursementDate = this.dateUtils.formatDate(expectedDisbursementDate, dateFormat);
    }
    const data = {
      ...approveLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.loanActionButtons(this.loanId, 'approve', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
