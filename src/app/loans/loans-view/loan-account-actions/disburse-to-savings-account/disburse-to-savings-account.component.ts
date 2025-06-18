import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { InputAmountComponent } from '../../../../shared/input-amount/input-amount.component';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-disburse-to-savings-account',
  templateUrl: './disburse-to-savings-account.component.html',
  styleUrls: ['./disburse-to-savings-account.component.scss'],
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
    InputAmountComponent,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class DisburseToSavingsAccountComponent implements OnInit {
  @Input() dataObject: any;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Disbursement Loan form. */
  disbursementForm: UntypedFormGroup;
  currency: Currency;

  /**
   * Get data from `Resolver`.
   * @param {FormBuilder} formBuilder FormBuilder.
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {LoansService} loanService Loan Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private loanService: LoansService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setDisbursementToSavingsForm();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }
  }

  /**
   * Set Disbursement Loan form.
   */
  setDisbursementToSavingsForm() {
    this.disbursementForm = this.formBuilder.group({
      actualDisbursementDate: [
        new Date(),
        Validators.required
      ],
      transactionAmount: [
        this.dataObject.amount,
        Validators.required
      ],
      note: ['']
    });
    if (this.dataObject.fixedEmiAmount) {
      this.disbursementForm.addControl(
        'fixedEmiAmount',
        new UntypedFormControl(this.dataObject.fixedEmiAmount, [Validators.required])
      );
    }
  }

  /**
   * Submit Disburse Form.
   */
  submit() {
    const disbursementLoanFormData = this.disbursementForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActualDisbursementDate: Date = this.disbursementForm.value.actualDisbursementDate;
    if (disbursementLoanFormData.actualDisbursementDate instanceof Date) {
      disbursementLoanFormData.actualDisbursementDate = this.dateUtils.formatDate(
        prevActualDisbursementDate,
        dateFormat
      );
    }
    const data = {
      ...disbursementLoanFormData,
      dateFormat,
      locale
    };
    const loanId = this.route.snapshot.params['loanId'];
    data['transactionAmount'] = data['transactionAmount'] * 1;
    this.loanService.loanActionButtons(loanId, 'disbursetosavings', data).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
