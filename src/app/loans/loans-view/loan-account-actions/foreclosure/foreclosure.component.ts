import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: 'mifosx-foreclosure',
  templateUrl: './foreclosure.component.html',
  styleUrls: ['./foreclosure.component.scss']
})
export class ForeclosureComponent implements OnInit {
  loanId: any;
  foreclosureForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  foreclosuredata: any;
  paymentTypes: any;

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
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  ngOnInit() {
    this.createforeclosureForm();
    this.onChanges();
  }

  createforeclosureForm() {
    this.foreclosureForm = this.formBuilder.group({
      'transactionDate': [new Date(), Validators.required],
      'outstandingPrincipalPortion': [{value: '', disabled: true}],
      'outstandingInterestPortion': [{value: '', disabled: true}],
      'outstandingFeeChargesPortion': [{value: '', disabled: true}],
      'outstandingPenaltyChargesPortion': [{value: '', disabled: true}],
      'transactionAmount': [{value: '', disabled: true}],
      'interestAccruedAfterDeath': '',
      'note': ''
    });
  }

  onChanges(): void {
    this.foreclosureForm.get('transactionDate').valueChanges.subscribe(val => {
      this.retrieveLoanForeclosureTemplate(val);
    });

  }

  retrieveLoanForeclosureTemplate(val: any) {
    const dateFormat = this.settingsService.dateFormat;
    const transactionDateFormatted = this.dateUtils.formatDate(val, dateFormat);
    const data = {
      command: 'foreclosure',
      dateFormat: this.settingsService.dateFormat,
      locale: this.settingsService.language.code,
      transactionDate: transactionDateFormatted
    };
    this.loanService.getForeclosureData(this.loanId, data)
    .subscribe((response: any) => {
      this.foreclosuredata = response;

      this.foreclosureForm.patchValue({
        outstandingPrincipalPortion: this.foreclosuredata.principalPortion,
        outstandingInterestPortion: this.foreclosuredata.interestPortion,
        outstandingFeeChargesPortion: this.foreclosuredata.feeChargesPortion,
        outstandingPenaltyChargesPortion: this.foreclosuredata.penaltyChargesPortion,
        foreClosureChargesPortion: this.foreclosuredata.foreClosureChargesPortion
      });
      if (this.foreclosuredata.unrecognizedIncomePortion) {
        this.foreclosureForm.patchValue({
          interestAccruedAfterDeath: this.foreclosuredata.unrecognizedIncomePortion
        });
      }
      this.calculateTransactionAmount();
      this.paymentTypes = this.foreclosuredata.paymentTypeOptions;
    });
  }

  calculateTransactionAmount() {
    let transactionAmount = 0;
    transactionAmount += parseFloat(this.foreclosuredata.principalPortion);
    transactionAmount += parseFloat(this.foreclosuredata.interestPortion);
    transactionAmount += parseFloat(this.foreclosuredata.feeChargesPortion);
    transactionAmount += parseFloat(this.foreclosuredata.penaltyChargesPortion);
    this.foreclosureForm.patchValue({
      transactionAmount: transactionAmount
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

    this.loanService.loanForclosureData(this.loanId, data)
      .subscribe((response: any) => {
        this.router.navigate([`../../general`], { relativeTo: this.route });
      });
    }

}
