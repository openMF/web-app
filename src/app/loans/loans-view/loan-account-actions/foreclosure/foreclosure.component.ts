import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoansService, LoanTransactionsService } from '@fineract/client';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-foreclosure',
  templateUrl: './foreclosure.component.html',
  styleUrls: ['./foreclosure.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class ForeclosureComponent implements OnInit {
  @Input() dataObject: any;

  loanId: any;
  foreclosureForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  foreclosuredata: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {LoanTransactionsService} loanTransactionsService Loan Transactions Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private loanTransactionsService: LoanTransactionsService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createforeclosureForm();
    this.onChanges();
  }

  createforeclosureForm() {
    this.foreclosureForm = this.formBuilder.group({
      transactionDate: [
        this.dataObject.date && new Date(this.dataObject.date),
        Validators.required
      ],
      outstandingPrincipalPortion: [{ value: this.dataObject.principalPortion || 0, disabled: true }],
      outstandingInterestPortion: [{ value: this.dataObject.interestPortion || 0, disabled: true }],
      outstandingFeeChargesPortion: [{ value: this.dataObject.feeChargesPortion || 0, disabled: true }],
      outstandingPenaltyChargesPortion: [{ value: this.dataObject.penaltyChargesPortion || 0, disabled: true }],
      transactionAmount: [{ value: this.dataObject.amount, disabled: true }],
      note: [
        '',
        Validators.required
      ]
    });
  }

  onChanges(): void {
    this.foreclosureForm.get('transactionDate').valueChanges.subscribe((val) => {
      this.retrieveLoanForeclosureTemplate(val);
    });
  }

  retrieveLoanForeclosureTemplate(val: any) {
    this.loanTransactionsService
      .retrieveTransactionTemplate({
        loanId: parseInt(this.loanId, 10),
        command: 'foreclosure'
      })
      .subscribe((response: any) => {
        this.foreclosuredata = response;

        this.foreclosureForm.patchValue({
          outstandingPrincipalPortion: this.foreclosuredata.principalPortion,
          outstandingInterestPortion: this.foreclosuredata.interestPortion,
          outstandingFeeChargesPortion: this.foreclosuredata.feeChargesPortion,
          outstandingPenaltyChargesPortion: this.foreclosuredata.penaltyChargesPortion
        });
      });
  }

  submit() {
    const foreclosureFormData = this.foreclosureForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.foreclosureForm.value.transactionDate;
    if (foreclosureFormData.transactionDate instanceof Date) {
      foreclosureFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...foreclosureFormData,
      dateFormat,
      locale
    };

    this.loanService
      .stateTransitions({
        loanId: Number(this.loanId),
        postLoansLoanIdRequest: data,
        command: 'foreclosure'
      })
      .subscribe((response: any) => {
        this.router.navigate([`../../general`], { relativeTo: this.route });
      });
  }
}
