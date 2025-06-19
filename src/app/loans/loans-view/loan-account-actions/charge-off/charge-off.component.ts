import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-charge-off',
  templateUrl: './charge-off.component.html',
  styleUrls: ['./charge-off.component.scss'],
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
    MatSelect,
    NgFor,
    MatOption,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ChargeOffComponent implements OnInit {
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
  /** Repayment Loan Form */
  chargeoffLoanForm: UntypedFormGroup;

  chargeOffReasonOptions: any = [];

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
   * Creates the repayment loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.chargeOffReasonOptions = this.dataObject.chargeOffReasonOptions;
    this.createChargeoffLoanForm();
  }

  /**
   * Creates the create close form.
   */
  createChargeoffLoanForm() {
    this.chargeoffLoanForm = this.formBuilder.group({
      transactionDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      externalId: '',
      chargeOffReasonId: '',
      note: ''
    });
  }

  submit() {
    const chargeoffLoanFormData = this.chargeoffLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransactionDate: Date = this.chargeoffLoanForm.value.transactionDate;
    if (chargeoffLoanFormData.transactionDate instanceof Date) {
      chargeoffLoanFormData.transactionDate = this.dateUtils.formatDate(prevTransactionDate, dateFormat);
    }
    const data = {
      ...chargeoffLoanFormData,
      dateFormat,
      locale
    };
    const command = 'charge-off';
    this.loanService.submitLoanActionButton(this.loanId, data, command).subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}
