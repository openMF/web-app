/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
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
    CdkTextareaAutosize
  ]
})
export class ApproveLoanComponent implements OnInit {
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private loanService: LoansService,
    private router: Router,
    private settingsService: SettingsService
  ) {
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
