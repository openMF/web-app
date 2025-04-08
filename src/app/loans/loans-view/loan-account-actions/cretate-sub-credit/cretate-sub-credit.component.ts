import { Component, OnInit, Input} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';

import { SettingsService } from 'app/settings/settings.service';
import { Currency } from 'app/shared/models/general.model';
@Component({
  selector: 'mifosx-cretate-sub-credit',
  templateUrl: './cretate-sub-credit.component.html',
  styleUrls: ['./cretate-sub-credit.component.scss']
})
export class CretateSubCreditComponent implements OnInit {

  @Input() dataObject: any;

  loanId: String;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  createSubCreditForm: UntypedFormGroup;
  currency: Currency;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private settingService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
   }

  ngOnInit(): void {
    this.maxDate = this.settingService.maxFutureDate;
    this.createSubCreditLoanForm();
    if (this.dataObject.currency) {
      this.currency = this.dataObject.currency;
    }

  }

  /**
   * Form to create new loan acording by reference loan
   */
  createSubCreditLoanForm() {
    this.createSubCreditForm = this.formBuilder.group({
      subCreditAmount:[
        '',
        Validators.required
      ],
      dateOfCreation: [
        this.settingService.businessDate,
        Validators.required
      ],
      referenceLoanId: [
        this.loanId
      ]
    });
  }

  /**
   *  Submits the new loan form
   */
  submit() {
    const createSubCreditFormData = this.createSubCreditForm.value;
    const locale = this.settingService.language.code;
    const dateFormat = this.settingService.dateFormat;

    const data = {
      ...createSubCreditFormData,
      locale,
      dateFormat
    };
    data['subCreditAmount'] = data['subCreditAmount'] * 1;
    this.loanService.executeLoansAccountTransactionsCommand(this.loanId.toString(), 'createSubCredit', data, null).subscribe((response: any) => {
      this.router.navigate(['../../general'], {
        relativeTo: this.route
      })
    });
  }

}
