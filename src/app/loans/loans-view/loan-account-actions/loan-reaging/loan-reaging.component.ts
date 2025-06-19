import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { DropdownOptions } from 'app/core/utils/dropdownOptions';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { OptionData } from 'app/shared/models/option-data.model';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loan-reaging',
  templateUrl: './loan-reaging.component.html',
  styleUrls: ['./loan-reaging.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    NgFor,
    MatOption,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class LoanReagingComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Repayment Loan Form */
  reagingLoanForm: UntypedFormGroup;

  frequencyOptions: OptionData[] = [];

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private dropdownOptions: DropdownOptions,
    private loanService: LoansService,
    private dateUtils: Dates
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
    this.frequencyOptions = this.dropdownOptions.retrievePeriodFrequencyTypeOptions(false);
  }

  ngOnInit(): void {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createReagingLoanForm();
  }

  createReagingLoanForm() {
    this.reagingLoanForm = this.formBuilder.group({
      numberOfInstallments: [
        1,
        Validators.required
      ],
      startDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      frequencyNumber: [
        1,
        Validators.required
      ],
      frequencyType: [
        ,
        Validators.required
      ],
      note: '',
      externalId: ''
    });
  }

  submit(): void {
    const reagingLoanFormData = this.reagingLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const startDate: Date = this.reagingLoanForm.value.startDate;
    if (reagingLoanFormData.startDate instanceof Date) {
      reagingLoanFormData.startDate = this.dateUtils.formatDate(startDate, dateFormat);
    }
    const data = {
      ...reagingLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAge').subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}
