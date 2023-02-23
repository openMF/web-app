/** Angular Imports. */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

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
   * @param {Dates} dateUtils Date Utils.
   * @param {Router} router Router.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private loanService: LoansService,
              private dateUtils: Dates,
              private router: Router,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const writeOffFormData = this.writeOffForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate = this.writeOffForm.value.transactionDate;
    if (writeOffFormData.transactionDate instanceof Date) {
      writeOffFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...writeOffFormData,
      dateFormat,
      locale
    };
    const loanId = this.route.snapshot.params['loanId'];
    delete data.amount;
    this.loanService.submitLoanActionButton(loanId, data, 'writeoff').subscribe((response: any) => {
      this.router.navigate(['../../general'], {relativeTo: this.route});
    });
  }

}
